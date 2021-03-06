#!/usr/bin/env python
#
#   Copyright (c) Finnbarr P. Murphy 2012.  All rights reserved.
#
#      Name: extension-tool 
#
#   Version: 1.5 (05/21/2012)
#
#   License: Attribution Assurance License
#   (see http://www.opensource.org/licenses)
#

import os
import sys
import argparse
 
from gi.repository import Gio
 
extstate = { 1:"enabled",
             2:"disabled",
             3:"error",
             4:"out of date",
             5:"downloading",
             6:"initialized",
            99:"uninstalled"}
 
exttype  = { 1:"system",
             2:"per user"}
 
EXTENSION_IFACE = 'org.gnome.Shell'
EXTENSION_PATH  = '/org/gnome/Shell'
ENABLED_EXTENSIONS_KEY = 'enabled-extensions'
 
 
class GnomeShell:
    def __init__(self):
        try:
            self.bus = Gio.bus_get_sync(Gio.BusType.SESSION, None)
            self.proxy1 = Gio.DBusProxy.new_sync(self.bus,
                                                 Gio.DBusProxyFlags.NONE,
                                                 None,
                                                 EXTENSION_IFACE,
                                                 EXTENSION_PATH,
                                                 EXTENSION_IFACE,
                                                 None)
            self.proxy2 = Gio.DBusProxy.new_sync(self.bus,
                                                 Gio.DBusProxyFlags.NONE,
                                                 None,
                                                 EXTENSION_IFACE,
                                                 EXTENSION_PATH,
                                                 'org.freedesktop.DBus.Properties',
                                                 None)
        except:
            print "Exception: %s" % sys.exec_info()[1]
            sys.exit(1)
 
    def list_extensions(self):
        return self.proxy1.ListExtensions()
 
    def enable_extension(self, uuid):
        return self.proxy1.EnableExtension('(s)', uuid)
 
    def disable_extension(self, uuid):
        return self.proxy1.DisableExtension('(s)', uuid)
 
    def get_shell_version(self):
        return self.proxy2.Get('(ss)', EXTENSION_IFACE, 'ShellVersion')
  
    def get_api_version(self):
        return self.proxy2.Get('(ss)', EXTENSION_IFACE, 'ApiVersion')
 
def enable_extension(uuid):
    settings = Gio.Settings(schema='org.gnome.shell')
    extensions = settings.get_strv(ENABLED_EXTENSIONS_KEY)
 
    if uuid in extensions:
        print >> sys.stderr, "%r is already enabled." % (uuid)
        sys.exit(1)
 
    s = GnomeShell()
    s.enable_extension(uuid);
    print "%r is now enabled." % (uuid)
 
def disable_extension(uuid):
    settings = Gio.Settings(schema='org.gnome.shell')
    extensions = settings.get_strv(ENABLED_EXTENSIONS_KEY)
 
    if uuid not in extensions:
        print >> sys.stderr, "%r is not enabled or installed." % (uuid,)
        sys.exit(1)
 
    s = GnomeShell()
    s.disable_extension(uuid);
    print "%r is now disabled." % (uuid,)
 
def disable_all_extensions():
    settings = Gio.Settings(schema='org.gnome.shell')
    extensions = settings.get_strv(ENABLED_EXTENSIONS_KEY)
 
    s = GnomeShell()
    for uuid in extensions:
        print "disabling %s" % (uuid)
        s.disable_extension(uuid);
 
    print "All extensions are now disabled."
 
def list_extensions():
    s = GnomeShell()
 
    l = s.list_extensions()
    for k, v in l.iteritems():
        print '%s: %s, %s' % (v["uuid"], extstate[v["state"]], exttype[v["type"]])
    print
 
def list_versions():
    s = GnomeShell()
    print "Extension Tool Version: %s" % "1.5"
    print "GNOME Shell Version: %s" % s.get_shell_version()
    print "GNOME Shell API Version: %s" % s.get_api_version()
 
def main():
    parser = argparse.ArgumentParser(description="GNOME Shell extension tool")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("-d", "--disable", nargs=1, action="store", dest="disable",
                       metavar="uuid", help="disable a GNOME Shell extension")
    group.add_argument("-D", "--disable-all", dest="disableall", 
                       action="store_true", help="disable all GNOME Shell extensions")
    group.add_argument("-e", "--enable", nargs=1, action="store", dest="enable",
                       metavar="uuid", help="enable a GNOME Shell extension")
    group.add_argument("-l", "--list-extension", dest="listext", 
                       action="store_true", help="list GNOME Shell extensions")
    group.add_argument('-v', '--version', dest="listver",
                       action="store_true", help="list version numbers")
 
    args = parser.parse_args()
 
    if args.disable:
        disable_extension("".join(args.disable))
    elif args.disableall:
        disable_all_extensions()
    elif args.enable:
        enable_extension("".join(args.enable))
    elif args.listext:
        list_extensions()
    elif args.listver:
        list_versions()
    else:
        parser.print_usage()
        sys.exit(0)
 
if __name__ == "__main__":
    main()

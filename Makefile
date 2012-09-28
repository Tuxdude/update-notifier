FILES := stylesheet.css metadata.json extension.js
DEST_DIR := $(HOME)/.local/share/gnome-shell/extensions/update-notifier@tuxdude.gnome.shell/

install:
	@rm -rf $(DEST_DIR) && mkdir -p $(DEST_DIR) && cp -rf $(FILES) $(DEST_DIR)

.PHONY: install

const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

let text, button;


function UpdateNotifierExtension() {
    this._init();
}

UpdateNotifierExtension.prototype = {
    _init: function() {
        this.button = new St.Bin({ style_class: 'panel-button',
                                   reactive: true,
                                   can_focus: true,
                                   x_fill: true,
                                   y_fill: false,
                                   track_hover: true });
        this.text = null;
        let icon = new St.Icon({ icon_name: 'system-run',
                                 icon_type: St.IconType.SYMBOLIC,
                                 style_class: 'system-status-icon' });
        this.button.set_child(icon);
        this.button.connect('button-press-event', Lang.bind(this, this._showHello));
    },

    _hideHello: function() {
        Main.uiGroup.remove_actor(text);
    },

    _showHello: function() {
        if (!this.text) {
            this.text = new St.Label({ style_class: 'helloworld-label',
                                       text: "Hello, world from Ash!" });
            Main.uiGroup.add_actor(this.text);
        }

        this.text.opacity = 128;

        let monitor = Main.layoutManager.primaryMonitor;

        this.text.set_position(Math.floor(monitor.width / 2 - this.text.width / 2),
                               Math.floor(monitor.height / 2 - this.text.height / 2));

        Tweener.addTween(this.text,
                         { opacity: 0,
                           time: 2,
                           transition: 'easeOutQuad',
                           onComplete: Lang.bind(this, this._hideHello) });
    },

    enable: function() {
        Main.panel._rightBox.insert_child_at_index(this.button, 0);
    },

    disable: function() {
        Main.panel._rightBox.remove_child(this.button);
    }
};

function init() {
    return new UpdateNotifierExtension();
}

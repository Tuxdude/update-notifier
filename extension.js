const Lang = imports.lang;
const Mainloop = imports.mainloop;
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

const TOOLTIP_LABEL_SHOW_TIME = 0.15;
const TOOLTIP_LABEL_HIDE_TIME = 0.1;
const TOOLTIP_HOVER_TIMEOUT = 300;

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
        this._hoverLabelTimeoutId = 0;
        this._hoverLabel;
        let icon = new St.Icon({ icon_name: 'system-run',
                                 icon_type: St.IconType.SYMBOLIC,
                                 style_class: 'system-status-icon' });
        this.button.set_child(icon);
        this.button.connect('button-press-event', Lang.bind(this, this._showHello));
        global.log('TEST LOG FROM ASH');
//        this.button.connect('notify::hover', Lang.bind(this, this._onButtonHover));
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

    _onButtonHover: function() {
        if (this.button.get_hover()) {
            if (this._hoverLabelTimeoutId == 0) {
                this._hoverLabelTimeoutId =
                    Mainloop.timeout_add(TOOLTIP_HOVER_TIMEOUT,
                                         Lang.bind(this,
                                                   function() {
                                                       this.showLabel();
                                                       return false;
                                                   }));
            }
        }
        else {
            if (this._hoverLabelTimeoutId > 0)
                Mainloop.source_remove(this._hoverLabelTimeoutId);
            this._hoverLabelTimeoutId = 0;
            this.hideLabel();
        }
    },

    setLabelText: function(text) {
        if (this._hoverLabel == null)
            this._hoverLabel = new St.Label({ style_class: 'update-notifier-label' });
        this._hoverLabel.set_text(text);
        Main.layouManager.addChrome(this._hoverLabel);
        this._hoverLabel.hide();
    },
    
    showLabel: function() {
        if (this._hoverLabel == null)
            this.setLabelText('Just a sample hover text');
        this._hoverLabel.opacity = 0;
        this._hoverLabel.show();

        let [stageX, stageY] = this.button.get_transformed_position();
        let node = this._hoverLabel.get_theme_node();
        let xOffset = node.get_length('-x-offset');
        let yOffset = node.get_length('-y-offset');

        let y = stageY + yOffset;
        let x = stageX - (this._hoverLabel.get_width()) / 2 + xOffset;

        this._hoverLabel.set_position(x, y);
        Tweener.addTween(this._hoverLabel,
                         { opacity : 255,
                           time : TOOLTIP_LABEL_SHOW_TIME,
                           transition : 'easeOutQuad'
                         });
    },

    hideLabel: function() {
        this._hoverLabel.opacity = 255;
        Tweener.addTween(this,_hoverLabel,
                         { opacity : 0,
                           time : TOOLTIP_LABEL_HIDE_TIME,
                           transition : 'easeOutQuad',
                           onComplete: Lang.bind(this,
                                                 function() { this._hoverLabel.hide(); } )
                         });
    },

    enable: function() {
        global.log('enable');
        Main.panel._rightBox.insert_child_at_index(this.button, 0);
    },

    disable: function() {
        global.log('disable');
        Main.panel._rightBox.remove_child(this.button);
    }
};

function init() {
    return new UpdateNotifierExtension();
}

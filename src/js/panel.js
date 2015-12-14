Panel.POSITION_LEFT = 1;
Panel.POSITION_RIGHT = 2;
Panel.POSITION_TOP = 4;
Panel.POSITION_BOTTOM = 6;

function Panel(selector, params) {
    var self = this;

    BuglessPanels.panels.push(self);
    self.element = document.querySelector(selector);
    self.innerElement = self.element.querySelector('.inner');
    self.x = null;
    self.y = null;

    if(!self.element)
        throw new Error('Panel "' + selector + '" not found');

    if(!params.position)
        throw new Error('Please specify the panel position');

    self.position = params.position;

    if(params.closeBySwipe !== false) {
        self.elementCMD = new CMD(self.element, {
            threshold: BuglessPanels.moveThreshold,
            preventScroll: true,
            innerElement: self.innerElement
        });

        switch(self.position) {
            case Panel.POSITION_LEFT:
                self.x = -100;
                self.y = 0;
                self.listenLeftSwipe();
                break;
            case Panel.POSITION_RIGHT:
                self.x = 100;
                self.y = 0;
                self.listenRightSwipe();
                break;
            case Panel.POSITION_TOP:
                self.x = 0;
                self.y = -100;
                self.listenTopSwipe();
                break;
            case Panel.POSITION_BOTTOM:
                self.x = 0;
                self.y = 100;
                self.listenBottomSwipe();
                break;
        }
    }

}


Panel.prototype.listenTopSwipe = function() {
    var self = this,
        sy = null;

    self.elementCMD.on('touchstart', function(e) {
        self.animateOff();
        sy = screen.height - e.touches[0].clientY;
    });

    self.elementCMD.on('movetop', function(e) {
        if(e.direction !== false && (self.element.scrollTop + self.element.offsetHeight) >= self.innerElement.offsetHeight) {
            var v = Help.calculatePercentageY(e.touches[0].clientY) + Help.calculatePercentageY(sy);
            self.moveY(v < 100 ? v : 100);
        }
    });

    self.elementCMD.on('moveendtop', function(e) {
        if(self.y < 100 - BuglessPanels.panelThreshold) {
            self.close();
        } else {
            self.open();
        }
    });
}


Panel.prototype.listenBottomSwipe = function() {
    var self = this,
        sy = null;

    self.elementCMD.on('touchstart', function(e) {
        self.animateOff();
        sy = e.touches[0].clientY;
    });

    self.elementCMD.on('movebottom', function(e) {
        if(e.direction !== false && self.element.scrollTop <= 0) {
            var v = Help.calculatePercentageY(e.touches[0].clientY) - Help.calculatePercentageY(sy);
            self.moveY(v > 0 ? v : 0);
        }
    });

    self.elementCMD.on('moveendbottom', function(e) {
        if(self.y > BuglessPanels.panelThreshold) {
            self.close();
        } else {
            console.log('open');
            self.open();
        }
    });
}


Panel.prototype.listenLeftSwipe = function() {
    var self = this,
        sx = null;

    self.elementCMD.on('touchstart', function(e) {
        self.animateOff();
        sx = screen.width - e.touches[0].clientX;
    });

    self.elementCMD.on('moveleft', function(e) {
        if(e.direction !== false) {
            var v = Help.calculatePercentageX(e.touches[0].clientX) + Help.calculatePercentageX(sx);
            self.moveX(v < 100 ? v : 100);
        }
    });

    self.elementCMD.on('moveendleft', function(e) {
        if(self.x < 100 - BuglessPanels.panelThreshold) {
            self.close();
        } else {
            self.open();
        }
    });
}

Panel.prototype.listenRightSwipe = function() {
    var self = this,
        sx = null;

    self.elementCMD.on('touchstart', function(e) {
        self.animateOff();
        sx = e.touches[0].clientX;
    });

    self.elementCMD.on('moveright', function(e) {
        if(e.direction !== false) {
            var v = Help.calculatePercentageX(e.touches[0].clientX) - Help.calculatePercentageX(sx);
            self.moveX(v > 0 ? v : 0);
        }
    });

    self.elementCMD.on('moveendright', function(e) {
        if(self.x > BuglessPanels.panelThreshold) {
            self.close();
        } else {
            self.open();
        }
    });
}

Panel.prototype.animateOff = function() {
    Help.removeClass(this.element, 'animate');
}

Panel.prototype.show = function() {
    this.element.style.display = 'block';
}

Panel.prototype.hide = function() {
    this.element.style.display = 'none';
}

Panel.prototype.moveX = function (value) {
    this.x = value;
    value = this.position == Panel.POSITION_LEFT ? (-100 + value) : value;
    this.element.style.transform = 'translateX(' + value + '%)';
}

Panel.prototype.moveY = function (value) {
    this.y = value;
    value = this.position == Panel.POSITION_TOP ? (-100 + value) : value;
    this.element.style.transform = 'translateY(' + value + '%)';
}

Panel.prototype.close = function () {
    var self = this;
    Help.addClass(this.element, 'animate');
    switch(this.position) {
        case Panel.POSITION_LEFT:
            this.moveX(0);
            break;
        case Panel.POSITION_RIGHT:
            this.moveX(100);
            break;
        case Panel.POSITION_TOP:
            this.moveY(0);
            break;
        case Panel.POSITION_BOTTOM:
            this.moveY(100);
            break;
    }

    var transitionEvent = Help.transitionEvent();
    function hidePanel() {
        self.hide();
        self.element.removeEventListener(transitionEvent, hidePanel);
    }
    if(transitionEvent) {
        self.element.removeEventListener(transitionEvent, hidePanel);
        self.element.addEventListener(transitionEvent, hidePanel);
    }
}

Panel.prototype.open = function () {
    var self = this;
    self.show();
    var intervalId = setInterval(function() {
        if(self.element.style.display == 'block') {
            Help.addClass(self.element, 'animate');
            switch(self.position) {
                case Panel.POSITION_LEFT:
                    self.moveX(100);
                    break;
                case Panel.POSITION_RIGHT:
                    self.moveX(0);
                    break;
                case Panel.POSITION_TOP:
                    self.moveY(100);
                    break;
                case Panel.POSITION_BOTTOM:
                    self.moveY(0);
                    break;
            }
            clearInterval(intervalId);
        }
    }, 50);
}

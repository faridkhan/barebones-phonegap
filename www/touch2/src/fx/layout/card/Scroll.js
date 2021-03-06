/**
 * @private
 */
Ext.define('Ext.fx.layout.card.Scroll', {
    extend: 'Ext.fx.layout.card.Abstract',

    requires: [
        'Ext.fx.easing.Linear'
    ],

    alias: 'fx.layout.card.scroll',

    config: {
        direction: 'left',

        duration: 150,

        reverse: null
    },

    constructor: function(config) {
        this.initConfig(config);

        this.doAnimationFrame = Ext.Function.bind(this.doAnimationFrame, this);
    },

    getEasing: function() {
        var easing = this.easing;

        if (!easing) {
            this.easing = easing = new Ext.fx.easing.Linear();
        }

        return easing;
    },

    updateDuration: function(duration) {
        this.getEasing().setDuration(duration);
    },

    onActiveItemChange: function(cardLayout, newItem, oldItem, options, controller) {
        var direction = this.getDirection(),
            easing = this.getEasing(),
            containerElement, inElement, outElement, containerWidth, containerHeight, reverse;

        if (newItem && oldItem) {
            if (this.isAnimating) {
                this.stopAnimation();
            }

            containerElement = this.getLayout().container.innerElement;
            containerWidth = containerElement.getWidth();
            containerHeight = containerElement.getHeight();

            inElement = newItem.renderElement;
            outElement = oldItem.renderElement;

            this.oldItem = oldItem;
            this.newItem = newItem;
            this.currentEventController = controller;
            this.containerElement = containerElement;
            this.isReverse = reverse = this.getReverse();

            newItem.show();

            if (direction == 'right') {
                direction = 'left';
                this.isReverse = reverse = !reverse;
            }
            else if (direction == 'down') {
                direction = 'up';
                this.isReverse = reverse = !reverse;
            }

            if (direction == 'left') {
                if (reverse) {
                    easing.setConfig({
                        startValue: containerWidth,
                        endValue: 0
                    });

                    containerElement.dom.scrollLeft = containerWidth;
                    outElement.setLeft(containerWidth);
                }
                else {
                    easing.setConfig({
                        startValue: 0,
                        endValue: containerWidth
                    });

                    inElement.setLeft(containerWidth);
                }
            }
            else {
                if (reverse) {
                    easing.setConfig({
                        startValue: containerHeight,
                        endValue: 0
                    });

                    containerElement.dom.scrollTop = containerHeight;
                    outElement.setTop(containerHeight);
                }
                else {
                    easing.setConfig({
                        startValue: 0,
                        endValue: containerHeight
                    });

                    inElement.setTop(containerHeight);
                }
            }

            this.startAnimation();

            controller.pause();
        }
    },

    startAnimation: function() {
        this.isAnimating = true;
        this.getEasing().setStartTime(Date.now());
        this.timer = setInterval(this.doAnimationFrame, 20);
        this.doAnimationFrame();
    },

    doAnimationFrame: function() {
        var easing = this.getEasing(),
            direction = this.getDirection(),
            scroll = 'scrollTop',
            value;

        if (direction == 'left' || direction == 'right') {
            scroll = 'scrollLeft';
        }

        if (easing.isEnded) {
            this.stopAnimation();
        }
        else {
            value = easing.getValue();
            this.containerElement.dom[scroll] = value;
        }
    },

    stopAnimation: function() {
        var direction = this.getDirection(),
            scroll = 'setTop';

        if (direction == 'left' || direction == 'right') {
            scroll = 'setLeft';
        }

        this.currentEventController.resume();

        if (this.isReverse) {
            this.oldItem.renderElement[scroll](null);
        }
        else {
            this.newItem.renderElement[scroll](null);
        }

        clearInterval(this.timer);
        this.isAnimating = false;
        this.fireEvent('animationend', this);
    }
});

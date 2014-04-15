(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * The column Status for planning board columns on a cardboard.
     */

    Ext.define('Rally.apps.releaseplanningboard.ReleasePlanningBoardColumnProgressBar', {
        extend: 'Ext.Component',
        alias: 'widget.rallyreleaseplanningboardcolumnprogressbar',

        renderTpl: Ext.create('Rally.ui.renderer.template.progressbar.TimeboxProgressBarTemplate', {
            height: '14px',
            width: '80%'
        }),

        update: function() {
            var html = this.renderTpl.apply(this._getRenderData());
            this.callParent([html]);
        },

        _getColumn: function() {
            return this.column;
        },

        _getRenderData: function() {
            var totalPointCount = this._getTotalPointCount();
            var plannedVelocity = this._getPlannedVelocity();
            return {
                percentDone: totalPointCount / plannedVelocity,
                amountComplete: totalPointCount,
                total: plannedVelocity
            };
        },

        _getTotalPointCount: function() {
            var total = 0;
            var self = this;
            setTimeout(function () {
              console.log('time');
              _.each(self._getColumn().getCards(true), function (card, index) {
                //console.log(card.getRecord().get('Release'));
                console.log(index, ' :: ', card.getRecord().get('Release').Name, ' :: ', card.getRecord().get('Name'));
              });
              console.log(self._getColumn()._cards.getCount());
            }, 1000);
            return _.reduce(this._getColumn().getCards(true), function(memo, card) {
                var planEstimate = card.getRecord().get('PreliminaryEstimate') ? parseInt(card.getRecord().get('PreliminaryEstimate').Value, 10) : 0;
                return Ext.isNumber(planEstimate) ? memo + planEstimate : memo;
            }, 0);
        },

        _getPlannedVelocity: function() {
            return _.reduce(this._getColumn().getTimeboxRecords(), function(memo, record) {
                var plannedVelocity = record.get('PlannedVelocity');
                return Ext.isNumber(plannedVelocity) ? memo + plannedVelocity : memo;
            }, 0);
        }
    });
})();

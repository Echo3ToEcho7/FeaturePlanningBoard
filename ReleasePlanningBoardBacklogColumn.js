(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * @private
     * Should this be in rui?
     */
    Ext.define('Rally.apps.releaseplanningboard.ReleasePlanningBoardBacklogColumn', {
        extend: 'Rally.ui.cardboard.Column',
        alias: 'widget.releaseplanningboardappbacklogcolumn',

        cls: 'column',

        requires: [
            'Rally.ui.TextField'
        ],

        mixins: {
            maskable: 'Rally.ui.mask.Maskable'
        },

        config: {
            value: null,
            backlogFilter: ''
        },

        getColumnStatus: function() {
            return this.columnStatus;
        },

        getStatusCell: function() {
            return Ext.get(this.statusCell);
        },

        drawHeader: function() {
            this.callParent(arguments);

            this.getColumnHeader().add(
                {
                    xtype: 'container',
                    cls: 'search',
                    items: [
                        {
                            xtype: 'rallytextfield',
                            cls: 'search-text',
                            itemId: 'searchText',
                            enableKeyEvents: true,
                            emptyText: 'Search',
                            listeners: {
                                specialkey: this._onSearchTextSpecialKey,
                                scope: this
                            }
                        },
                        {
                            xtype: 'component',
                            cls: 'search-button',
                            listeners: {
                                click: {
                                    element: 'el',
                                    fn: this._onSearchClicked,
                                    scope: this
                                }
                            }
                        }
                    ]
                }
            );
        },

        initComponent: function() {
            this.callParent(arguments);

            this.on('afterrender', function() {
                var cls = 'planning-column backlog';
                this.getContentCell().addCls(cls);
                this.getStatusCell().addCls(cls);
                this.getColumnHeaderCell().addCls(cls);
            }, this, {single: true});
        },

        _onSearchClicked: function() {
            this._refreshColumn();
        },

        _onSearchTextSpecialKey: function(searchTextField, e) {
            if (e.getKey() === e.ENTER) {
                this._refreshColumn();
            }
        },

        _refreshColumn: function() {
            if (this.searching) {
                return;
            }

            this.searching = true;
            var searchValue = this.getColumnHeader().down('#searchText').getValue();
            this.setMaskTarget(this.getContentCell());
            this.showMask();
            this._deactivatedCards = [];

            this.on('load', function() {
                this.fireEvent('filter', this);
                this.hideMask();
                this.searching = false;
            }, this, {single: true});

            this.refresh({
                storeConfig: {
                    search: searchValue ? Ext.String.trim(searchValue) : ""
                }
            });
        },

        getStoreFilter: function(model) {
            var filters = [];
            Ext.Array.push(filters, this.callParent(arguments));
            if (model.isPortfolioItem()) {
                if (!Ext.isEmpty(this.backlogFilter)) {
                    filters = [Rally.data.wsapi.Filter.fromQueryString(this.backlogFilter)];
                } else {
                    filters.push({
                        property: 'Release',
                        value: null
                    });
                }
            }

            return filters;
        },

        isMatchingRecord: function(record) {
            var isMatching = this.callParent(arguments);
            if (record.self.elementName.indexOf('PortfolioItem') !== -1) {
                if (Ext.isEmpty(this.backlogQuery)) {
                    isMatching = isMatching && (!record.hasField('Release') || record.get('Release') === null);
                }
            }
            return isMatching;
        }
    });
})();

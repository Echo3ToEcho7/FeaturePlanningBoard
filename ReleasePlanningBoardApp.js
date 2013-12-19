(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Release Planning Board App
     * The Release Planning Board can be used to visualize and assign your User Stories and Defects within the appropriate release.
     */
    Ext.define('Rally.apps.releaseplanningboard.ReleasePlanningBoardApp', {
        extend: 'Rally.app.App',
        requires: [
            'Rally.data.ModelFactory',
            'Rally.apps.releaseplanningboard.TimeboxGridBoard',
            'Rally.apps.releaseplanningboard.TimeboxScrollable',
            //'Rally.ui.gridboard.plugin.GridBoardAddNew',
            //'Rally.ui.gridboard.plugin.GridBoardArtifactTypeChooser',
            //'Rally.ui.gridboard.plugin.GridBoardManageReleases',
            'Rally.ui.gridboard.plugin.GridBoardFilterInfo',
            'Rally.util.Array'
        ],
        mixins: ['Rally.app.CardFieldSelectable'],
        cls: 'planning-board',
        itemId: 'app',

        config: {
            defaultSettings: {
                cardFields: 'Parent,PreliminaryEstimate'
            }
        },

        launch: function() {
            var me = this;
            var piTypeStore = Ext.create('Rally.data.wsapi.Store', {
              model: 'TypeDefinition',
              autoload: false,
              filters: [{
                property: 'Parent.Name',
                operator: '=',
                value: 'Portfolio Item'
              }, {
                property: 'Creatable',
                operator: '=',
                value: 'true'
              }, {
                property: 'Ordinal',
                operator: '=',
                value: 0
              }]
            });

            piTypeStore.load().then({
              success: function (recs) {
                me.featureName = _.first(recs).get('ElementName');
                me._showBoard();
              }
            });
        },

        getSettingsFields: function () {
            var fields = this.callParent(arguments);
            this.appendCardFieldPickerSetting(fields);
            _.last(fields).modelTypes = ['PortfolioItem/' + this.featureName];
            fields.push({type: 'query'});
            return fields;
        },

        _showBoard: function() {
            var me = this;
            var plugins = [
                    {
                        ptype: 'rallygridboardfilterinfo',
                        isGloballyScoped: Ext.isEmpty(this.getSetting('project')) ? true : false
                    },
                    'rallygridboardfieldpicker'
                ];

            Ext.create('Rally.data.wsapi.Store', {
                autoLoad: true,
                remoteFilter: false,
                model: 'TypeDefinition',
                sorters: [{
                    property: 'Ordinal',
                    direction: 'Desc'
                }],
                filters: [{
                    property: 'Ordinal',
                    value: 0
                }, {
                    property: 'Parent.Name',
                    operator: '=',
                    value: 'Portfolio Item'
                }, {
                    property: 'Creatable',
                    operator: '=',
                    value: 'true'
                }],
                listeners: {
                    load: function (store, recs) {
                        me.modelName = recs[0].get('TypePath');
                        me.gridboard = this.add({
                            xtype: 'releaseplanningboardapptimeboxgridboard',
                            context: this.getContext(),
                            modelNames: me.modelName,
                            plugins: plugins,
                            backlogFilter: this.getSetting('query'),
                            cardBoardConfig: {
                                cardConfig: {
                                    editable: true,
                                    showIconMenus: true,
                                    fields:  this.getCardFieldNames(),
                                    showBlockedReason: true
                                },
                                listeners: {
                                    filter: this._onBoardFilter,
                                    filtercomplete: this._onBoardFilterComplete,
                                    scope: this
                                },
                                plugins: [
                                    {
                                        ptype: 'rallytimeboxscrollablecardboard',
                                        backwardsButtonConfig: {
                                            elTooltip: 'Previous Release'
                                        },
                                        columnRecordsProperty: 'timeboxRecords',
                                        forwardsButtonConfig: {
                                            elTooltip: 'Next Release'
                                        },
                                        getFirstVisibleScrollableColumn: function(){
                                            return this.getScrollableColumns()[0];
                                        },
                                        getLastVisibleScrollableColumn: function(){
                                            return Rally.util.Array.last(this.getScrollableColumns());
                                        },
                                        getScrollableColumns: function(){
                                            return Ext.Array.slice(this.cmp.getColumns(), 1, this.cmp.getColumns().length);
                                        }
                                    }
                                ]
                            },
                            listeners: {
                                load: this._onLoad,
                                toggle: this._publishContentUpdated,
                                recordupdate: this._publishContentUpdatedNoDashboardLayout,
                                recordcreate: this._publishContentUpdatedNoDashboardLayout,
                                preferencesaved: this._publishPreferenceSaved,
                                scope: this
                            }
                    });
                },
                    scope: me
                }
            });
        },

        _getCardFields: function() {
            if (this.showFieldPicker) {
                var fieldString = this.getSetting('cardFields') || '';
                return fieldString.split(',');
            }

            return [];
        },

        _onLoad: function() {
            this._publishContentUpdated();
            if (Rally.BrowserTest) {
                Rally.BrowserTest.publishComponentReady(this);
            }
        },

        _onBoardFilter: function() {
           this.setLoading(true);
        },

        _onBoardFilterComplete: function() {
           this.setLoading(false);
        },

        _publishContentUpdated: function() {
            this.fireEvent('contentupdated');
        },

        _publishContentUpdatedNoDashboardLayout: function() {
            this.fireEvent('contentupdated', {dashboardLayout: false});
        },

        _publishPreferenceSaved: function(record) {
            this.fireEvent('preferencesaved', record);
        }
    });
})();

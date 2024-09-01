/**
 * アクションによって値をセット(デスクトップ)
 */
(function(PLUGIN_ID) {
  'use strict';

  var configObj = kintone.plugin.app.getConfig(PLUGIN_ID);
  var configs = configObj.configs && JSON.parse(configObj.configs);
  var options = configs ? configs.options : [];

  var acountSelectFieldsType = ['USER_SELECT', 'ORGANIZATION_SELECT', 'GROUP_SELECT'];
/**
 * @type {Array.<String>} events: kintoneイベント
 */
  var events = [
    'app.record.create.show'
  ];
  kintone.events.on(events, function(event) {
    var record = event.record;
    //イベントタイプのラストワード
    // var eTypeLastWord = event.type.substr(event.type.lastIndexOf('.') + 1);

    var matched_appId = location.search.match(/app=(\d+)/);
    var matched_actionId = location.search.match(/action=(\d+)/);
    if(matched_appId && matched_actionId) {
      options.filter(function(opt) {
        return opt.app.id === matched_appId[1] && opt.action.id === matched_actionId[1];
      }).map(function(opt) {
        opt.putValueFields.map(function(putField) {
          if(record[putField.code] && record[putField.code].type === putField.type) {
            if(acountSelectFieldsType.indexOf(putField.type) >= 0) {
              record[putField.code].value = putField.value.map(function(value) { return {code: value}; });
            } else {
              record[putField.code].value = putField.value;
            }
          }
        })
      })
    }
    

    return event;
  });
  
})(kintone.$PLUGIN_ID);
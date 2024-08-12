import React from "react";

import Container from "@mui/material/Container";

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import KintoneRestAPIClient from 'KintoneRestAPIClient';

import Title from "./components/title";
import Options from "./components/options";
import SaveButtons from "./components/saveButtons";

const theme = createTheme({
  components: {
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          marginBottom: '20px'
        }
      }
    }
  }
});

const pluginSettings = {
  title: 'アクションによって値を自動セット',
  description: '設定したフィールドの値をアクションによって自動セットすることができる'
};

const initialPutField = {
  code: null,
  type: null,
  value: null
};

const initialOption = {
  app: {id: null, name: ''},
  action: {id: null, name: ''},
  putValueFields: [initialPutField]
};

const RestAPI_client = new KintoneRestAPIClient();

export default function Config ({pluginId}) {
  // アプリ一覧
  const [apps, setApps] = React.useState([]);
  // 適用先アプリのフィールド一覧
  const [fields_thisApp, setFields_thisApp] = React.useState([]);
  // アプリの設定値
  const [options, setOptions] = React.useState([initialOption]);      
  // アプリアクションの一覧
  const [appActions, setAppActions] = React.useState(new Array(options.length).fill([]));

  const excludeFieldTypes = ['CATEGORY', 'ステータス', 'RECORD_NUMBER', '__ID__', 'CREATED_TIME', 'CREATOR', 'STATUS_ASSIGNEE', 'UPDATED_TIME', 'MODIFIER', '__REVISION__', 'FILE', 'CALC'];

  const fields = fields_thisApp.filter(field => excludeFieldTypes.indexOf(field.type) < 0);

  function hundleClickSave() {
    kintone.plugin.app.setConfig({options: JSON.stringify(options)});
  }

  function hundleClickCancel() {
    location.href = location.href.match(/^.*plugin\//)[0] + '#/';
  }
  
  React.useEffect(() => {
    getAllApps(0).then(apps => setApps(apps));
    // setApps(getAllApps(0));
    
    RestAPI_client.app.getFormFields({ app: kintone.app.getId(), preview: true })
      .then(resp => {
        setFields_thisApp(Object.keys(resp.properties).map((key) => resp.properties[key]));
      });        
            
    // コンフィグ情報の取得
    const configObj = kintone.plugin.app.getConfig(pluginId);
    if(configObj.options) {
      const newOptions = JSON.parse(configObj.options).map(option => optionInit(option));
      setOptions(newOptions);
      
      /* アクションの取得 */
      const newAppActions = newOptions.map(async (opt) => {
        let actions = [];
        if(opt.app.id) {
          actions = await getActions(opt.app.id).then((resp) => Object.keys(resp.actions).map((actProp) => { return {id: resp.actions[actProp].id, name: resp.actions[actProp].name} }));
        }
        return actions;
      });    
      Promise.all(newAppActions).then((appActions) => {
        setAppActions(appActions);
      });
    };          
  }, []);  

  function getActions(app) {
    return RestAPI_client.app.getAppActions({app, preview: true});
  }
  
  const optionInit = (option) => {Object.assign({...initialOption}, option); return option;};

  const getAllApps = async (offSet, gotApps = []) => {
    const resp = await RestAPI_client.app.getApps({offset: offSet});
    gotApps = gotApps.concat(resp.apps.map(app => ({id: app.appId, name: app.name})));

    if(resp.apps.length === 100) return getAllApps(offSet + 100, gotApps);
    return gotApps;    
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Container>
          <Title title={pluginSettings.title} description={pluginSettings.description} />
          <Options 
            options={options} 
            setOptions={(options) => {setOptions(options);} } 
            apps={apps}
            appActions={appActions}
            setAppActions={(actions) => {setAppActions(actions);}}
            getActions={getActions}
            fields={fields} 
            initialOption={initialOption} 
          />
        </Container>
        <SaveButtons saveFunc={() => {hundleClickSave()}} cancelFunc={() => {hundleClickCancel()}}/>
      </ThemeProvider>
    </React.Fragment>
  );
};
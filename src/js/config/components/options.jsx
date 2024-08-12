import React from "react";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from '@mui/icons-material/Remove';
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

const RestAPI_client = new KintoneRestAPIClient();

const Item = styled(Paper)(({theme}) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,  
  border: "1px solid " + theme.palette.primary
}));

const InnerItem = styled(Paper)(({theme}) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),  
}));

export default function Options({options, setOptions, apps, appActions, setAppActions, getActions, fields, initialOption}) {    
  const [allUsers, setAllUsers] = React.useState([]);
  const [allOrganizations, setAllOrganizations] = React.useState([]);
  const [allGroups, setAllGroups] = React.useState([]);

  const multiSelectFieldTypes = ['CHECK_BOX', 'MULTI_SELECT', 'USER_SELECT', 'ORGANIZATION_SELECT', 'GROUP_SELECT'];  

  React.useEffect(() => {
    
    (async () => {      
      { /* ユーザー・グループ・組織の取得 */
          [
          {setStateFunc: setAllUsers, apiFuc: getUsers},
          {setStateFunc: setAllOrganizations, apiFuc: getOrganizations},
          {setStateFunc: setAllGroups, apiFuc: getGroups}
        ].forEach(async (setStateObj) => {        
          let newAllUserApiValues = [];
          let userApiValues = [];
          do {
            userApiValues = await setStateObj.apiFuc(0);
            newAllUserApiValues = newAllUserApiValues.concat(userApiValues);
          } while(userApiValues.length === 100);
          setStateObj.setStateFunc(newAllUserApiValues);
        });
      }           
    })();
  }, []);  

  async function hundleChangeApp(value, index) {
    let newOptions = [...options];
    const id = value ? value.id : null;
    const name = value ? value.name : '';
    newOptions[index].app = {id, name};
    newOptions[index].action = {...initialOption.action};
    // アプリのアクション取得
    let newAppActions = [...appActions];
    let insertAction = [];
    if(value) insertAction = await getActions(value.id).then((resp) => Object.keys(resp.actions).map((actProp) => { return {id: resp.actions[actProp].id, name: resp.actions[actProp].name} }));
    newAppActions[index] = insertAction;
    setAppActions(newAppActions);
    setOptions(newOptions);
  }

  function hundleChangeAction(value, index) {
    let newOptions = [...options];
    const id = value ? value.id : null;
    const name = value ? value.name : '';
    newOptions[index].action = {id, name};
    setOptions(newOptions);
  }

  function hundleChangePutValueField(valueObj, optIndex, index) {
    let newOptions = [...options];
    const code = valueObj ? valueObj.code : null;
    const type = valueObj ? valueObj.type : null;
    newOptions[optIndex]['putValueFields'][index].code =  code;
    newOptions[optIndex]['putValueFields'][index].type =  type;
    newOptions[optIndex]['putValueFields'][index].value = multiSelectFieldTypes.indexOf(fields[fields.findIndex((field) => field.code === code)].type) >= 0 ? [] : null;
    setOptions(newOptions);
  }

  function hundleChangePutValue(valueObj, optIndex, index) {
    let newOptions = [...options];
    newOptions[optIndex]['putValueFields'][index].value = valueObj && valueObj.value;
    setOptions(newOptions);
  }

  function hundleChangePutValues(values, optIndex, index) {
    let newOptions = [...options];
    newOptions[optIndex]['putValueFields'][index].value = values && values.map((valueObj) => valueObj.value);
    setOptions(newOptions);
  }

  function hundleClickAddPutValueField(optIdx, idx) {
    let newOptions = [...options];
    newOptions[optIdx].putValueFields.splice(idx+1, 0, {...initialOption.putValueFields[0]});
    setOptions(newOptions);
  }

  function hundleClickDelPutValueField(optIdx, idx) {
    let newOptions = [...options];
    newOptions[optIdx].putValueFields.splice(idx, 1);
    setOptions(newOptions);
  }
  
  function hundleClickAddOption(index) {
    let newOptions = [...options];
    newOptions.splice(index+1, 0, JSON.parse(JSON.stringify(initialOption)));
    setOptions(newOptions);
    let newAppActions = [...appActions];
    newAppActions.splice(index+1, 0, []);
    setAppActions(newAppActions);
  }

  function hundleClickDelOption(index) {
    let newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  }  

  function getUsers(offset) {
    return kintone.api(kintone.api.url('/v1/users', true), 'GET', {offset}).then(resp => resp.users.map(user => ({code: user.code, name: user.name})));    
  }

  function getOrganizations(offset) {
    return kintone.api(kintone.api.url('/v1/organizations', true), 'GET', {offset}).then(resp => resp.organizations.map(org => ({code: org.code, name: org.name})));    
  }

  function getGroups(offset) {
    return kintone.api(kintone.api.url('/v1/groups', true), 'GET', {offset}).then(resp => resp.groups.map(group => ({code: group.code, name: group.name})));    
  }

  function setOptions_AutoComplete(field) {
    switch(field.type) {
      case 'USER_SELECT': {
        return allUsers.map(user => ({label: user.name, value: user.code}));
      }
      case 'ORGANIZATION_SELECT': {
        return allOrganizations.map(org => ({label: org.name, value: org.code}));
      }
      case 'GROUP_SELECT': {
        return allGroups.map(group => ({label: group.name, value: group.code}));
      }
      case 'CHECK_BOX':
      case 'MULTI_SELECT':
      case 'RADIO_BUTTON': {
        return Object.keys(field.options).map((key) => ({label: field.options[key].label, value: field.options[key].label}));
      }
    }
  }

  function setValues_AutoComplete(field, values) {
    if(!values) return null;    
    switch(field.type) {
      case 'USER_SELECT': {
        return allUsers.filter((user) => values.indexOf(user.code) >= 0).map((user) => ({label: user.name, value: user.code}));
      }
      case 'ORGANIZATION_SELECT': {
        return allOrganizations.filter((org) => values.indexOf(org.code) >= 0).map((org) => ({label: org.name, value: org.code}));
      }
      case 'GROUP_SELECT': {
        return allGroups.filter((group) => values.indexOf(group.code) >= 0).map((group) => ({label: group.name, value: group.code}));
      }
      case 'RADIO_BUTTON': 
      case 'DROP_DOWN': {
        return Object.keys(field.options).map((key) => field.options[key].label).findIndex((label) => label === values) >= 0 ? {label: values, value: values} : null;
      }
      case 'CHECK_BOX':
      case 'MULTI_SELECT': {
        return values.filter((value) => Object.keys(field.options).map((key) => field.options[key].label).findIndex((label) => label === value) >= 0).map((value) => ({label: value, value: value}));
      }
    }
  }

  function hundleChangeText(value, optIdx, idx) {
    let newOptions = [...options];
    newOptions[optIdx].putValueFields[idx].value = value ? value : null;
    setOptions(newOptions);
  }

  return (
    <Stack spacing={2}>
      {
        options.map((opt,optIdx) => (
          <Item key={optIdx}>
            <Autocomplete
              options={apps}
              value={(opt.app.id && apps.findIndex((appObj) => appObj.id === opt.app.id) >= 0) ? apps[apps.findIndex((appObj) => appObj.id === opt.app.id)] : null}
              noOptionsText="見つかりません"
              isOptionEqualToValue={(option, value) => option.id && option.id === value.id}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => <TextField {...params} label="アプリ" />}
              onChange={(event, value) => {hundleChangeApp(value, optIdx);}}
              size="small"
              sx={{width: '500px'}}
            />
            <Autocomplete
              options={appActions[optIdx]}
              value={appActions[optIdx].findIndex((action) => action.id === opt.action.id) >= 0 ? appActions[optIdx][appActions[optIdx].findIndex((action) => action.id === opt.action.id)] : {id: null, name: ''}}
              isOptionEqualToValue={(option, value) => option.id && option.id === value.id}
              getOptionLabel={(option) => option.name}
              noOptionsText="見つかりません"                                
              renderInput={(params) => <TextField {...params} label="アクション" />}
              onChange={(event, value) => {hundleChangeAction(value, optIdx)}}
              size="small"
              sx={{width: '500px'}}
            />
            <Stack spacing={1}>
              {opt.putValueFields.map((pvField, idx) => (
                <InnerItem key={idx}>
                  <Autocomplete
                    options={fields.map((field) => ({label: field.label, code: field.code, type: field.type}))}
                    value={(pvField.code && fields.findIndex((field) => field.code === pvField.code) >= 0) ? fields.filter((field) => field.code === pvField.code)[0] : null}
                    noOptionsText="見つかりません"                                
                    renderInput={(params) => <TextField {...params} label="値をセットするフィールド" />}
                    onChange={(event, value) => {hundleChangePutValueField(value, optIdx, idx)}}
                  />
                  {
                    (() => {
                      if(!opt.putValueFields[idx].code || fields.findIndex(field => field.code === opt.putValueFields[idx].code) < 0) return;
                      const fieldIndex = fields.findIndex(field => field.code === opt.putValueFields[idx].code);
                      
                      if(multiSelectFieldTypes.indexOf(fields[fieldIndex].type) >= 0) {
                        return <Autocomplete
                          multiple
                          options={setOptions_AutoComplete(fields[fieldIndex])}
                          getOptionLabel={(option) => option.label}
                          isOptionEqualToValue={(option, value) => option.value && option.value === value.value}
                          renderInput={(params) => <TextField {...params} label="セットする値" />}
                          onChange={(event, value) => {hundleChangePutValues(value, optIdx, idx)}}
                          value={setValues_AutoComplete(fields[fieldIndex], opt.putValueFields[idx].value)}
                        />;
                      } else {
                        if(fields[fieldIndex].type === 'RADIO_BUTTON' || fields[fieldIndex].type === 'DROP_DOWN') {
                          return <Autocomplete
                            options={Object.keys(fields[fieldIndex].options).map((key) => ({label: fields[fieldIndex].options[key].label, value: fields[fieldIndex].options[key].label}))}
                            getOptionLabel={(option) => option.label}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            renderInput={(params) => <TextField {...params} label="セットする値" />}
                            onChange={(event, value) => {hundleChangePutValue(value, optIdx, idx)}}
                            value={setValues_AutoComplete(fields[fieldIndex], opt.putValueFields[idx].value)}
                          />;
                        } else {
                          return <TextField 
                            label="セットする値" 
                            variant="outlined" 
                            fullWidth={true}
                            value={opt.putValueFields[idx].value}
                            onChange={(event) => {hundleChangeText(event.target.value, optIdx, idx)}}
                          />
                        }
                      }               
                    })()
                  }
                  <Stack direction="row" spacing={2}>
                    <Fab size="small" sx={{color: 'white'}} aria-label="add-putvalie-field" onClick={(e) => {hundleClickAddPutValueField(optIdx, idx);}}>
                      <AddIcon color="primary" />
                    </Fab>
                    {
                      opt.putValueFields.length > 1 && (
                        <Fab size="small" sx={{color: 'white'}} aria-label="delete-putvalie-field" onClick={(e) => {hundleClickDelPutValueField(optIdx, idx);}}>
                          <RemoveIcon color="error" />
                        </Fab>
                      )
                    }
                  </Stack>
                </InnerItem>
              ))}
            </Stack>          
            <Stack direction="row" spacing={2} sx={{marginTop: '10px'}}>
              <Fab size="small" color="primary" aria-label="add-putvalie-field" onClick={(e) => {hundleClickAddOption(optIdx);}}>
                <AddIcon />
              </Fab>
              {
                options.length > 1 && (
                  <Fab size="small" color="error" aria-label="delete-putvalie-field" onClick={(e) => {hundleClickDelOption(optIdx);}}>
                    <RemoveIcon />
                  </Fab>
                )
              }
            </Stack>
          </Item>
        ))
      }
    </Stack>
  )
}
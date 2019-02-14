import Vue from 'vue';
import Vuex from 'vuex'

import Util from './Util';
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    user: sessionStorage.user?JSON.parse(sessionStorage.user):false||{},
    customer: sessionStorage.customer?JSON.parse(sessionStorage.customer):false||{}
  },
  mutations: {
    changeUser(state, payload) {
      let user = {...payload.user};
      state.user = user;
      Util.setUserStorage(JSON.stringify(state.user));
      
      state.customer = {};
      Util.removeCustomerStorage();
    },
    removeUser(state){
      state.user = {};
      Util.removeUserStorage();
    },
    changeCustomer(state, payload) {
      let customer = {...payload.customer};
      state.customer = customer;
      Util.setCustomerStorage(JSON.stringify(state.customer));

      state.user = {};
      Util.removeUserStorage();
    },
    removeCustomer(state){
      state.customer = {};
      Util.removeCustomerStorage();
    },
    logout(state) {
      state.customer = {};
      Util.removeCustomerStorage();
      state.user = {};
      Util.removeUserStorage();
    }
  },
  getters:{
    user(state) {
      if(state.user && state.user.name){
        Util.setUserStorage(JSON.stringify(state.user));
      }else if(Util.getUserStorage() == "{}"){
        Util.removeUserStorage();
      }
      return state.user;
    }
  } 
});

export default store;
<template>
  <div>
    <v-app-bar
      app
      dense
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        新機能ご紹介アンケート
      </div>

      <v-spacer></v-spacer>

      <!--<v-btn-->
      <!--  class="submit" v-bind:disabled="isPush" v-on:click="createTargetTable()">-->
      <!--  <span class="mr-2">{{submitState}}</span>-->
      <!--  <v-icon>mdi-open-in-new</v-icon>-->
      <!--</v-btn>-->
    </v-app-bar>
    
    <v-container>
    <v-row>
      <v-col>
        <v-treeview
          v-model="selection"
          :items="changeFormatResult"
          :selection-type="selectionType"
          selectable
          return-object
          open-all
          dense
        >
          
        <template v-slot:prepend="{ item }">
          {{item.date}} : {{item.title}} <a v-if="item.url" :href="item.url" target="_blank" >link</a>
        </template>
          
        </v-treeview>
      </v-col>
      <v-divider vertical></v-divider>
      <v-col
        class="pa-6"
        cols="6"
      >
        <template>
          <v-data-table
            :headers="headers"
            :items="voteNewServiceUpdateList" 
            :items-per-page="10"
            class="elevation-1"
            mustSort
            :sort-by="['voteCount']"
            :sort-desc="[true]"
          >
            <template v-slot:item.voteCount="{ item }">
              <v-chip
                :color="getColor(item.voteCount)"
                dark
              >
                {{ item.voteCount }}
              </v-chip>
            </template>
          </v-data-table>
        </template>
      </v-col>
    </v-row>
    </v-container>
  </div>
</template>



<script>

import { API, graphqlOperation } from "aws-amplify"
import { listSourceTables } from "../graphql/queries"
import { createTargetTable, updateSourceTable } from "../graphql/mutations"
import { onUpdateSourceTable } from '@/graphql/subscriptions'
import { orderBy } from 'lodash'

export default {
  data:function () {
    return {
      // changedListForTreeview
      changeFormatResult: [],
      // newServiceUpdateList
      NewServiceUpdateList: [],
      // votedNewServiceUpdateList
      voteNewServiceUpdateList:[],
      selectionType: 'leaf',
      // selectedList
      selection: [],
      // 確認後削除
      isPush : false,
      submitState : "submit", 
      onUpdateEventSubscription: null,
      // tableHeaders
      headers: [
          {
            text: 'みんなの投票',
            align: 'start',
            sortable: true,
            value: 'title',
          },
          { text: 'Count', value: 'voteCount' },
      ],
    }
  },
  mounted: function () {
    this.changeFormat();//appsyncで帰ってくるオブジェクトのリストを、treeviewのフォーマットに変換する
    this.onUpdateEventSubscription = API.graphql(
      graphqlOperation(onUpdateSourceTable),
    ).subscribe({
      next: data => {
        console.log('onUpdateSourceTable')
        console.log(data)
        console.log(data.value)
        const updatedEvent = data.value.data.onUpdateSourceTable
        // this.NewServiceUpdateList[updatedEvent.title] = updatedEvent.voteCount
        for (let i = 0 ; i < this.NewServiceUpdateList.length ; i++){
          if (this.NewServiceUpdateList[i].title == updatedEvent.title){
            this.NewServiceUpdateList[i].voteCount = updatedEvent.voteCount
          }
        }
        this.voteNewServiceUpdateList = this.NewServiceUpdateList.filter(x => x.voteCount > 0 )
      }
      },
    )
  },
  watch: {
    selection: async function(newVal, oldVal) {
      // データの値が変化した時にコンソールに新しい値と古い値を出力
      // console.log(newVal, oldVal)
      if (newVal.length > oldVal.length){
        const addCountItem = newVal.filter(i => oldVal.indexOf(i) == -1)
        console.log(addCountItem[0].title , addCountItem[0].voteCount+1);
        for (let i = 0 ; i < addCountItem.length ; i++){
          await API.graphql(graphqlOperation(updateSourceTable, { input: { title: addCountItem[i].title, voteCount: addCountItem[i].voteCount+1 }}));
        }
      } else {
        const delCountItem = oldVal.filter(i => newVal.indexOf(i) == -1)
        console.log(delCountItem[0].title , delCountItem[0].voteCount-1);
        for (let i = 0 ; i < delCountItem.length ; i++){
          await API.graphql(graphqlOperation(updateSourceTable, { input: { title: delCountItem[i].title, voteCount: delCountItem[i].voteCount-1 }}));
        }
      }
    }
  },
  methods: {
    changeFormat: async function () {
      const limit = 1000
      let NewServiceUpdateList = await API.graphql(graphqlOperation(
        listSourceTables, {limit: limit}
      ))
      this.NewServiceUpdateList = orderBy(NewServiceUpdateList.data.listSourceTables.items,'category','desc')
      console.log(this.NewServiceUpdateList)
      this.voteNewServiceUpdateList = this.NewServiceUpdateList.filter(x => x.voteCount > 0 )

      // categories
      let result = [];
      // result resultListForTreeview
      let temp = [];
      // const newServiceUpdateList = this.NewServiceUpdateList
      const tests = this.NewServiceUpdateList //this.tests を this.NewServiceUpdateListへ変更した。
      // console.log(tests)
      tests.forEach(function(element){
        result.push(element.category)
      })
      let set = new Set(result);//重複を削除
      // console.log(set)

      set.forEach(function(element){
        temp.push({ name: element, children: [] })//tempにname：カテゴリのみで、childrenの中身がないがわが出来上がる
      })
      tests.forEach(function(element_source){
        temp.forEach(function(element){
          if (element.name == element_source.category){
            console.log("yes")
            element.children.push(element_source)//childrenに中身を追加
          }else{
            console.log("No")
          }
        })
      })
      // var -> let
      var count = 1 ;
      for (  var i = 0;  i < temp.length;  i++  ) {
        temp[ i ].id = count ;
        count++;
        for (  var j = 0;  j < temp[ i ].children.length;  j++  ) {
          temp[ i ].children[ j ].id = count;
          count++;
        }
      }
      console.log(temp)
      this.changeFormatResult = temp;
    },
    createTargetTable: async function () {
      this.isPush = true;
      this.submitState = "Thank you!";
      const selection = this.selection
      for (  var i = 0;  i < selection.length;  i++  ) {
        try {
          await API.graphql(graphqlOperation(createTargetTable, { input: { title: selection[i].title, category: selection[i].category }}));
        } catch (error) {
        error
        }
      }
    },
    getColor (voteCount) {
      if (voteCount > 2) return 'red'
      else if (voteCount > 1) return 'orange'
      else if (voteCount > 0) return 'green'
      else return 'grey'
    },
  }
}
</script>
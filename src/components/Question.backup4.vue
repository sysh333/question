<template>
  <div>
    <v-app-bar
      app
      dense
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        AWS新機能ご紹介アンケート
      </div>

      <v-spacer></v-spacer>

      <v-btn
        class="submit" v-bind:disabled="isPush" v-on:click="createTargetTable()"
      >
        <span class="mr-2">{{submitState}}</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
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
          {{item.date}} : <a :href="item.url" target="_blank" >{{item.title}}</a>
        </template>
          
        </v-treeview>
      </v-col>
      <v-divider vertical></v-divider>
      <v-col
        class="pa-6"
        cols="6"
      >
        <!--<template v-if="!selection.length">-->
        <!--  No nodes selected.-->
        <!--</template>-->
        <!--<template v-else>-->
          <div
            v-for="item in NewServiceUpdateList"
            :key="item.title" 
          >
            {{ item.voteCount }}
            {{ item.title }}
          </div>

        <!--</template>-->
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
      changeFormatResult: [],
      NewServiceUpdateList: [],
      limit: 2 ** 31 - 1,
      selectionType: 'leaf',
      selection: [],
      isPush : false,
      submitState : "submit", 
      onUpdateEventSubscription: null,
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
        await API.graphql(graphqlOperation(updateSourceTable, { input: { title: addCountItem[0].title, voteCount: addCountItem[0].voteCount+1 }}));
      } else {
        const delCountItem = oldVal.filter(i => newVal.indexOf(i) == -1)
        console.log(delCountItem[0].title , delCountItem[0].voteCount-1);
        await API.graphql(graphqlOperation(updateSourceTable, { input: { title: delCountItem[0].title, voteCount: delCountItem[0].voteCount-1 }}));
      }
    }
  },
  methods: {
    changeFormat: async function () {
      let NewServiceUpdateList = await API.graphql(graphqlOperation(
        listSourceTables, {limit: this.limit}
      ))
      this.NewServiceUpdateList = orderBy(NewServiceUpdateList.data.listSourceTables.items,'date','desc')
      console.log(this.NewServiceUpdateList)

      let result = [];
      let temp = [];
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
    }

  }
}
</script>
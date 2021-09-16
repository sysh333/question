<template>
<v-app>
  <v-app-bar app>アンケート</v-app-bar>
  <v-main>
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
        <a :href="item.url">
          <span>{{item.date}} : {{item.title}}</span>
        </a>
        </template>
          
        </v-treeview>
      </v-col>
      <v-divider vertical></v-divider>
      <v-col
        class="pa-6"
        cols="6"
      >
        <template v-if="!selection.length">
          No nodes selected.
        </template>
        <template v-else>
          <div
            v-for="node in selection"
            :key="node.id"
          >
            {{ node.title }}
          </div>
          <button class="submit" v-on:click="createTargetTable()">Post</button>
        </template>
      </v-col>
    </v-row>
    </v-container>
  </v-main>
</v-app>
</template>



<script>
import { API, graphqlOperation} from "aws-amplify"
import { listSourceTables } from "../graphql/queries"
import { createTargetTable } from "../graphql/mutations"
export default {
  data () {
    return {
      changeFormatResult: [],
      NewServiceUpdateList: [],
      limit: 2 ** 31 - 1,
      selectionType: 'leaf',
      selection: [],
    }
  },
  mounted: function () {
    this.changeFormat()//appsyncで帰ってくるオブジェクトのリストを、treeviewのフォーマットに変換する
  },
  methods: {
    changeFormat: async function () {
      let NewServiceUpdateList = await API.graphql(graphqlOperation(
        listSourceTables, {limit: this.limit}
      ))
      this.NewServiceUpdateList = NewServiceUpdateList.data.listSourceTables.items
      console.log(this.NewServiceUpdateList)

        let result = [];
      let temp = [];
      const tests = this.NewServiceUpdateList //this.tests を this.NewServiceUpdateListへ変更した。
      console.log(tests)
      tests.forEach(function(element){
        result.push(element.category)
      })
      let set = new Set(result);//重複を削除
      console.log(set)

      set.forEach(function(element){
        temp.push({ name: element, children: [] })//tempにname：カテゴリのみで、childrenの中身がないがわが出来上がる
      })
      tests.forEach(function(element_source){
        temp.forEach(function(element){
          if (element.name == element_source.category){
            // console.log(element.name)
            // console.log(element_source.category)
            console.log("yes")
            element.children.push(element_source)//childrenに中身を追加
          }else{
            console.log("No")
          }
        })
      })
      console.log(temp)
      
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
    
    //多分こんな感じで、selectionを取ってくるのだろう。
    createTargetTable: async function () {
      const selection = this.selection
      //多分ここでselectionのリストをバラしてDynamoDBに入れるのだろうか。
      try {
        await API.graphql(graphqlOperation(createTargetTable, {input: selection}))
      } catch (error) {
        error
      }
    }

  }
}
</script>
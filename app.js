const express=require('express');
const {open}=require('sqlite');
const sqlite3=require('sqlite3');
const path=require('path');

const app=express()

app.use(express.json());


const dbPath=path.join(__dirname, 'todoApplication.db')
let db=null;
const initializeDbAndServer=async()=>{
try{ db=await open({
        filename:dbPath,
        driver:sqlite3.Database
    })
    app.listen(3000, ()=>{
        console.log("server started")
    })
    }
    catch(e){
        console.log(`DB Error ${e.message}`);
        process.exit(1);
    }
 
}


initializeDbAndServer();

const priorityValues=["HIGH", "MEDIUM", 'LOW'];
const categoryValues=["WORK", "HOME", "LEARNING"];
const statusValues=['TO DO', 'IN PROGRESS', 'DONE'];

//  GET API

app.get('/todos/',async(request,response)=>{
    
    let{priority='', category='', status='', search_q=''}=request.query;
      
     if(priority!=='')
        {if (!priorityValues.includes(priority)){
            response.status(400)
            response.send('Invalid Todo Priority')
        }}
   
      if (category!=='') { if (!categoryValues.includes(category)){
            response.status(400);
            response.send('Invalid Todo Category');
        }}
       
    
     if (status!==''){
        if(status.includes("%20")){
        status=status.replace("%20", " ")}
        if (!statusValues.includes(status)){
            response.status(400);
            response.send('Invalid Todo Status');
        }
    }
    
// console.log(status);
    const getTodosQuery=`
    SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND  priority LIKE '%${priority}%' AND status LIKE '%${status}%' AND category LIKE '%${category}%';
    `;
    const todosResponse=await db.all(getTodosQuery);
   // console.log(todosResponse);
    response.send(todosResponse);
});

//GET TODO API

app.get('/todos/:todoId/', async(request, response) => {
  const{todoId}=request.params;
  const getTodoQuery=`SELECT * FROM todo WHERE id LIKE ${todoId};`;
  const getTodoResponse=await db.get(getTodoQuery);
  response.send(getTodoResponse);
})


// Based  on date API

app.get('/agenda/', async(request,response)=>{
    const{date=''}=request.query

    const getTodoBasedOnDate=`SELECT * FROM todo WHERE due_date LIKE '%${date}%';`;
    const responseData=await db.all(getTodoBasedOnDate)
    response.send(responseData);
})


//ADD TODO

app.post('/todos/', async(request, response)=>{
    const todoDetails=request.body;
    const{id,todo,priority,status,category,dueDate}=todoDetails;

    const addTodoQuery=`
    INSERT INTO todo(id,todo,priority,status,category,due_date)
    VALUES(${id},'${todo}','${priority}','${status}','${category}','${dueDate}');
    `;
    await db.run(addTodoQuery);
    response.send('Todo Successfully Added');
})


// Update Todo

app.put('/todos/:todoId/', async(request, response)=>{
    const{todoId}=request.params;
    const getTodo=`SELECT * FROM todo WHERE id=${todoId};`;
    const todoResponse=await db.get(getTodo)
    
    const{todo=todoResponse['todo'], priority=todoResponse['priority'],status=todoResponse['status'],category=todoResponse['category'],dueDate=todoResponse['due_date']}=request.body;

    const updateTodoQuery=`UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id=${todoId};`;
   const updateResponse= await db.run(updateTodoQuery);
   if(todo!==todoResponse['todo']){
    response.send('Todo Update')
   }
   if(status!==todoResponse['status']){
    response.send('Status Updated')
   }
   if(priority!==todoResponse['priority']){
    response.send('Priority Updated');
   }
   if(category!==todoResponse['category']){
    response.send('Category Updated')
   }
   if(dueDate!==todoResponse['due_date']){
    response.send('Due Date Updated');
   }
})


//DELETE TODO

app.delete('/todos/:todoId', async(request, response)=>{
    const{todoId}=request.params;
    const deleteTodoQuery=`DELETE FROM todo WHERE id=${todoId};`;
    await db.run(deleteTodoQuery);
    response.send('Todo Deleted')
})

module.exports= app;
const express = require('express');
const cors = require('cors');
// const mysql = require('mysql');
const { createClient } = require('@supabase/supabase-js');
require("dotenv").config();


const app = express();

app.use(cors());
app.use(express.json());
const port= 3300;
const supabaseUrl = "https://kykxspcgnsbnzvbofapj.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl,supabaseKey);

//MySQL Connection
// const connection = mysql.createConnection({
//     host: '127.0.0.1',
//     user: 'root',
//     password: '',
//     database: 'mydb'
// })

// connection.connect((err) => {
//     if (err){
//         console.log('Error connecting to MySQL database = ',err)
//         return;
//     }
//     console.log('MySQL succesfully connected!');
// })

////////////////////////////////////Register/////////////////////////////////////////////////

//signup
app.post("/signup", async (req,res) => {
    const {email,username,password} = req.body;
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                username: username,
            }
        }
    });
    // await supabase.from("profile_user").insert({username:username});
    if (error){
        res.status(500).json(error);
    }
    else{
        res.status(200).json(data);
    }
});

app.get("/getprofile/:id",async (req,res) =>{
    const {id} = req.params
    const { data: {user}, error } = await supabase.auth.admin.getUserById(id)
    if (error){
        res.status(500).json(error);
    }
    else{
        res.status(200).json({
            email: user.email,
            user_metadata: user.user_metadata
        });
    }
})


//edit_profile
app.post("/edit_profile",async (req,res) =>{
    const {username,email,id,avatar_url} = req.body;
    const { data:user, error } = await supabase.auth.admin.updateUserById(
        id,
        { user_metadata: { username: username ,avatar_url:avatar_url} }
    )
    const { ERROR } = await supabase
    .from("profile_user")
    .update({ username:username,avatar_url:avatar_url })
    .eq("email",email )
    if (error ){
        res.status(500).json(error);
    }
    else{
        res.status(200).json(user);
    }
})

//createpost
app.post("/creatpost", async (req,res)=>{
    const {title,content,category,email,id,image_title,image_link} = req.body;
    const {data ,error} = await supabase.from("Create_Post").insert({title:title,content:content,category:category,email:email,id:id,image_title:image_title,image_link:image_link})
    if (error){
        res.status(500).json(error);
    }
    else{
        res.status(200).json(data);
    }

})

//delete
app.delete("/deletepost",async (req,res)=>{
    const {id_post} = req.query;
    const {error} = await supabase.from("Create_Post").delete().eq('id_post', id_post)
    if (error){
        res.status(500).json(error);
    }
    else{
        res.status(200).json({msg:"success"})
    }
})

//like_post
app.post("/likepost",async (req,res) =>{
    const {id_post,id} = req.body;
    const {data,error} = await supabase.from("likes").insert({id_post:id_post,id:id})
    if (error ){
        res.status(500).json(error);
    }
    else{
        console.log(data);
        res.status(200).json(data);
    }
})

//count_like
app.get("/countlike",async (req,res) =>{
    const {id_post} = req.query;
    const {data,error} = await supabase
    .from("likes")
    .select('*', { count: 'exact' })
    .eq("id_post",id_post)
    if (error ){
        res.status(500).json(error);
    }
    else{
        // console.log(data.length);
        res.status(200).json(data);
    }
})

//unlike
app.delete("/unlike",async (req,res)=>{
    const {id_post,id} = req.query;
    const {error} = await supabase.from("likes").delete().eq('id',id).eq('id_post',id_post)
    if (error){
        res.status(500).json(error);
    }
    else{
        res.status(200).json({msg:"success"})
    }
})

//comment
app.post("/commentpost",async (req,res) =>{
    const {id,id_post,comment} = req.body;
    const {data,error} = await supabase.from("comments").insert({id:id,id_post:id_post,comment:comment})
    if (error ){
        res.status(500).json(error);
    }
    else{
        res.status(200).json(data);
    }
})

//show_comment
app.get("/showcomment",async (req,res) =>{
    const {id_post} = req.query
    const {data,error} = await supabase.from("comments").select('user: profiles(username),comment').eq("id_post",id_post)
    if (error ){
        res.status(500).json(error);
    }
    else{
        res.status(200).json(data);
    }
})




//randompost
app.post("/randompost",async (req,res) => {
    const { data, error } = await supabase
    .from('updaterandom') // Replace with your table name
    .select('id_post,title,category,user:profiles!Create_Post_id_fkey(username),image_link')
    // .order('random()') // This orders the rows randomly
    .limit(6); // Adjust the limit as needed
    if (error) {
        console.error('Error fetching random rows:', error);
    } else {
        res.status(200).json(data);
        // console.log('Random rows:', data);
    // Do something with the random rows
    }
})


//show_like
app.get("/showlike",async (req,res)=>{
    const {id} = req.query;
    const {data,error} = await supabase
    .from('likes')
    .select('id_post,title:Create_Post(title),user:profiles!likes_id_fkey(username),category:Create_Post(category),image:Create_Post(image_link)').eq("id", id)
    if (error){
        console.log(data)
        res.status(400).json(error);
    }
    else{
        res.status(200).json(data);
    }
})

//post_to_profile
app.get("/posttoprofile",async (req,res)=> {
    const {id} = req.query;
    const {data,error} = await supabase.from("Create_Post").select('id_post,title,category,user:profiles!Create_Post_id_fkey(username),image_link').eq("id",id)
    if (error){
        console.log(error)
        res.status(400).json(error);
    }
    else{
        res.status(200).json(data);
    }
})

//post_to_category
app.get("/posttocategory",async (req,res)=> {
    const {category} = req.query;
    const {data,error} = await supabase.from("Create_Post").select('id_post,title,user:profiles!Create_Post_id_fkey(username),image_link').eq("category",category)
    if (error){
        console.log(error)
        res.status(400).json(error);
    }
    else{
        res.status(200).json(data);
    }
})

//detailpost
app.get("/detailpost",async (req,res)=> {
    const {id_post} = req.query;
    const {data,error} = await supabase.from("Create_Post").select('id,title,name:profiles!Create_Post_id_fkey(username),content,image_link').eq("id_post",id_post)
    if (error){
        console.log(data)
        res.status(400).json(error);
    }
    else{
        res.status(200).json(data);
    }
})
//name_profile
app.get("/nameprofile", async (req, res) => {
    const {id} = req.query;
    const { data, error } = await supabase.from("Create_Post").select('id,user:profiles!Create_Post_id_fkey(username)').eq("id",id);
    if (error){
        console.log(data)
        res.status(400).json(error);
    }
    else{
        res.status(200).json(data);
    }
})

//id_to_pic
app.get("/idtopic", async (req, res) => {
    const {id} = req.query;
    const { data, error } = await supabase.from("profiles").select('avatar_url').eq("id",id);
    if (error){
        console.log(data)
        res.status(400).json(error);
    }
    else{
        res.status(200).json(data);
    }
})

//blogger
app.post("/blogger", async (req, res) => {
    const { data, error } = await supabase.from('distinct_id').select('user:profiles(id, username),image: profiles(avatar_url)');
    if (error) {
        console.error(error);
        res.status(400).json(error);
    } else {
        res.status(200).json(data);
    }
});

//search
app.post("/search",async (req,res)=> {
    // const {id} = req.query;
    const {data,error} = await supabase.from("Create_Post").select('title,user:profiles!Create_Post_id_fkey(username),category,id_post,image_link') 
    if (error){
        console.log(error)
        res.status(400).json(error);
    }
    else{
        res.status(200).json(data);
    }
})
//login
// app.post("/login",async (req,res) => {
//     const{email,password} = req.body;
//     const { data, error } = await supabase.auth.signInWithPassword({
//         email: email,
//         password: password
//     });
//     if (error){
//         res.status(400).json(err.sqlMessage);
//     }
//     else{
//         res.status(200).json(data)
//     }
// });

    // const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    // connection.query(sql,[req.body.email,req.body.password],(err,data) =>{
    //     // console.log(data);
    //     if (err) {
    //         return res.status(400).json(err.sqlMessage);
    //     }
    //     if (data.length > 0){
    //         return res.status(200).json({status:'complete_login',msg: "Success to login"});
    //     } else{
    //         return res.status(400).json({status: 'not login',msg:"Faile to login"});
    //     }
    // })


//forgot_password
app.get("/forgot_password",async (req,res) => {
    // const sql = "SELECT * FROM users WHERE email = ?"
    // const email = req.body.email
    // connection.query(sql,[email],(err,data) =>{
    //     if (err) {
    //         return res.status(400).json(err.sqlMessage);
    //     }
    //     if (data.length > 0){
    //         return res.status(200).json("There is an email ");
    //     }
    //     return res.status(400).json("This email doesn't exist!");
    // })
})

//reset_password
app.patch("/reset_password",async (req,res) =>{
    // const sql = "UPDATE users SET password = ? WHERE email = ?"
    // const {email,newpassword,confirmpassword} = req.body;
    // connection.query(sql,[newpassword,email,confirmpassword],(err,data) =>{
    //     if (err) {
    //         return res.status(400).json(err.sqlMessage);
    //     }
    //     if (newpassword == confirmpassword){
    //         return res.status(200).json("Succes to update your new password!");
    //     }
    //     return res.status(400).json("password must be the same");
    // })
})
//profile
app.get("/profile", async (req,res) => {
    // const sql = "SELECT username, avatar FROM users";
    // connection.query(sql,(err,data) =>{
    //     if (err) {
    //         return res.status(400).json(err.sqlMessage);
    //     }
    //     return res.status(200).json({status: "myprofile",data})
    // })
})


////////////////////////////////////////////writeblog/////////////////////////////////////////////////////////

//cleaning
app.post("/writeblog/cleaning",async (req,res) => {
    // const sql1 = "SELECT * FROM users WHERE id = ? ";
    // const sql2 = "INSERT INTO cleaning(id,title_name,image_title,content) VALUES (?, ?, ?, ?)";
    // const {id,title_name,image_title,content} = req.body;
    // connection.query(sql1,[id],(err,data) => {
    //     if (err) {
    //         return res.status(400).json(err.sqlMessage);
    //     }
    //     if (data[0].id == id){
    //         connection.query(sql2,[id,title_name,image_title,content],(err,data) => {
    //             if(err) {
    //                 return res.status(400).json(err.sqlMessage);
    //             }
    //             return res.status(200).json("Your blog will be posted");
    //         })
    //     }
    //     else{
    //         return res.status(400).json({status: "fail" ,msg:"You should login before write the blog!"});
    //     }
    // })
})

//decoration
app.post("/writeblog/decoration",async (req,res) => {
    // const sql1 = "SELECT * FROM users WHERE id = ? ";
    // const sql2 = "INSERT INTO decoration(id,title_name,image_title,content) VALUES (?, ?, ?, ?)";
    // const {id,title_name,image_title,content} = req.body;
    // connection.query(sql1,[id],(err,data) => {
    //     if (err) {
    //         return res.status(400).json(err.sqlMessage);
    //     }
    //     if (data[0].id == id){
    //         connection.query(sql2,[id,title_name,image_title,content],(err,data) => {
    //             if(err) {
    //                 return res.status(400).json(err.sqlMessage);
    //             }
    //             return res.status(200).json("Your blog will be posted");
    //         })
    //     }
    //     else{
    //         return res.status(400).json({status: "fail" ,msg:"You should login before write the blog!"});
    //     }
    // })
})

//food
app.post("/writeblog/food",async (req,res) => {
    // const sql1 = "SELECT * FROM users WHERE id = ? ";
    // const sql2 = "INSERT INTO food(id,title_name,image_title,content) VALUES (?, ?, ?, ?)";
    // const {id,title_name,image_title,content} = req.body;
    // connection.query(sql1,[id],(err,data) => {
    //     if (err) {
    //         return res.status(400).json(err.sqlMessage);
    //     }
    //     if (data[0].id == id){
    //         connection.query(sql2,[id,title_name,image_title,content],(err,data) => {
    //             if(err) {
    //                 return res.status(400).json(err.sqlMessage);
    //             }
    //             return res.status(200).json("Your blog will be posted");
    //         })
    //     }
    //     else{
    //         return res.status(400).json({status: "fail" ,msg:"You should login before write the blog!"});
    //     }
    // })
})

//dekhor_story
app.post("/writeblog/dekhor_story",async (req,res) => {
    // const sql1 = "SELECT * FROM users WHERE id = ? ";
    // const sql2 = "INSERT INTO dekhor_story(id,title_name,image_title,content) VALUES (?, ?, ?, ?)";
    // const {id,title_name,image_title,content} = req.body;
    // connection.query(sql1,[id],(err,data) => {
    //     if (err) {
    //         return res.status(400).json(err.sqlMessage);
    //     }
    //     if (data[0].id == id){
    //         connection.query(sql2,[id,title_name,image_title,content],(err,data) => {
    //             if(err) {
    //                 return res.status(400).json(err.sqlMessage);
    //             }
    //             return res.status(200).json("Your blog will be posted");
    //         })
    //     }
    //     else{
    //         return res.status(400).json({status: "fail" ,msg:"You should login before write the blog!"});
    //     }
    // })
})


//////////////////////////////////////edit your blog////////////////////////////////////////////

//cleaning
app.patch("/writeblog/edited_cleaning",async (req,res) =>{
    // const sql1 = "SELECT * FROM users WHERE id = ? ";
    // const sql2 = "UPDATE cleaning SET title_name = ? , image_title = ? , content = ? WHERE id_cleaning = ?";
    // const {id,id_cleaning,title_name,image_title,content} = req.body;
    // connection.query(sql1,[id],(err,data) => {
    //     if (err) {
    //         return res.status(400).json(err.sqlMessage);
    //     }
    //     if (data[0].id == id){
    //         connection.query(sql2,[title_name,image_title,content,id_cleaning],(err,data) =>{
    //             if (err) {
    //                 return res.status(400).json(err.sqlMessage);
    //             }
    //             if (data.length != 0){
    //                 return res.status(200).json("Success to edited your blog");
    //             }
    //             return res.status(400).json("Fail to edited your blog");
    //         })
    //     }
    //     else{
    //         return res.status(400).json({status: "fail" ,msg:"You haven't an account"});
    //     }
    // })
})

//decoration
app.patch("/writeblog/edited_decoration",async (req,res) =>{
    // const sql1 = "SELECT * FROM users WHERE id = ? ";
    // const sql2 = "UPDATE decoration SET title_name = ? , image_title = ? , content = ? WHERE id_decoration = ?";
    // const {id,id_decoration,title_name,image_title,content} = req.body;
    // connection.query(sql1,[id],(err,data) => {
    //     if (err) {
    //         return res.status(400).json(err.sqlMessage);
    //     }
    //     if (data[0].id == id){
    //         connection.query(sql2,[title_name,image_title,content,id_decoration],(err,data) =>{
    //             if (err) {
    //                 return res.status(400).json(err.sqlMessage);
    //             }
    //             if (data.length != 0){
    //                 return res.status(200).json("Success to edited your blog");
    //             }
    //             return res.status(400).json("Fail to edited your blog");
    //         })
    //     }
    //     else{
    //         return res.status(400).json({status: "fail" ,msg:"You haven't an account"});
    //     }
    // })
})

//food
app.patch("/writeblog/edited_food",async (req,res) =>{
    // const sql1 = "SELECT * FROM users WHERE id = ? ";
    // const sql2 = "UPDATE food JOIN users ON food.id = users.id SET title_name = ? , image_title = ? , content = ?  WHERE id_food = ?";
    // const {id,id_food,title_name,image_title,content} = req.body;
    // connection.query(sql1,[id],(err,data) => {
    //     if (err) {
    //         return res.status(400).json(err.sqlMessage);
    //     }
    //     if (data[0].id == id){
    //         connection.query(sql2,[title_name,image_title,content,id_food],(err,data) =>{
    //             if (err) {
    //                 return res.status(400).json(err.sqlMessage);
    //             }
    //             if (data.length != 0){
    //                 return res.status(200).json("Success to edited your blog");
    //             }
    //             return res.status(400).json("Fail to edited your blog");
    //         })
    //     }
    //     else{
    //         return res.status(400).json({status: "fail" ,msg:"You haven't an account"});
    //     }
    // })
})


//yourblog
app.get("/")



app.listen(port, () => console.log(`Server is running on port ${port}`));
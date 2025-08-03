const noticeBoard = require("../models/noticeBoard");
// const notices = require("../models/noticeBoard")

const createNotice = async(req,res)=>{
    try{
        const {blockName} = req.params
        const {message} = req.body
        const response = await noticeBoard.updateOne(
            { blockName }, // match block
            {
            $push: {
                notices: {
                $each: [{
                    message,
                    postedBy: "System" // you can customize this
                }],
                $position: 0 // insert at beginning
                }
            }
            },
            { upsert: true }
        );
        if(!response.acknowledged)
            res.status(404).json("user error..")
        res.status(200).json(response)
    }catch(err){
        res.status(500).json(err.message)
    }
}

const getAllNotices = async(req,res)=>{
    try{
        const {blockName} = req.params
        const response = await noticeBoard.findOne({blockName})
        
        if(!response)
            res.status(404).json("something went wrong....")
        res.status(200).json(response.notices)
    }catch(err){
        res.status(500).json(err.message)
    }
}

const deleteNotice = async(req,res)=>{
    try{
        const {blockName,id} = req.params

        const response = await noticeBoard.updateOne(
            {blockName},
            {$pull:{notices:{"_id":id}}} 
        )

        if(!response.modifiedCount)
            res.status(404).json("Notice is not found or already deleted..")
        res.status(200).json(response)
    }catch(err){
        res.status(500).json(err.message)
    }
}

module.exports = {createNotice,getAllNotices,deleteNotice}
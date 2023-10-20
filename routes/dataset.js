const express = require('express');
const router = express.Router();
const util = require('../util');
const datasetSchema = require('../models/dataset.js');
const moment = require('moment');
const format = require('util').format;
const { check, validationResult } = require('express-validator');
var mongoose = require('mongoose');
var jwtPassport = require('../jwtPassport');

/**
 * @apiDefine DFHeader @apiVersion 0.1.0
 * @apiHeader (Digital Factory header) {String} Content-Type application/json
 * @apiHeader (Digital Factory header) {String} Authorization Users JWT token Ex.: JWT <token>
 * @apiHeaderExample {json} Header-example
 *  {
 *      "Content-Type" : "application/json",
 *      "Authorization": "JWT <token>",
 *  }
 *
*/

/**
 * @api {get} /dataset/id/:id GET document based on ObjectID
 * @apiUse DFHeader
 * @apiGroup Dataset
 * @apiVersion 0.1.0
 * @apiName GetDatasetDoc
 * @apiParam {String} id URL parameter. 24-character Mongo ID of the dataset.
 * @apiExample {curl} Example usage:
 *      curl -i http://baseURL/dataset/id/<dataset OjectID>
 *
 * @apiSuccess {Object} Dataset document
 */

/**
 * @api {get} /dataset/ GET dataset documents
 * @apiDescription Filter dataset documents based on adding a URL query [name, , ...]
 * @apiName GetDatasetDoc
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiGroup Dataset
 *
 * @apiParam {String} [name] Filter based on name
 * @apiExample {curl} Example usage:
 *      curl -i http://baseURL/dataset?name="CAM-TS-01:MultiCoat.Y2_FT_01"
 *
 * @apiSuccess {Object} Dataset document
 */


/**
 * @api {get} /dataset/tags GET active tag names 
 * @apiName GetAllTags
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiGroup Dataset
 * @apiParam {String} [equipment] Filter list of tags based on equipment name
 *
 * @apiSuccess {String[]} tags List of all tags drawn from the names of all
 * datasets contained in the database. Returned without object wrapping.
 */
//router.get('/tags', async function (req, res, next) {
router.get('/tags', jwtPassport.isAuthorized, async function (req, res, next) {
  try {
    var datasets = await util.getModel()["Dataset"].find(
      {/* get all datasets*/}, {'name': 1});
    var tagSet = new Set();
    if (req.query.equipment) {
      prefix = req.query.equipment.toString()
      datasets.forEach(e => {
        if (e.name.includes(prefix) ) tagSet.add(e.name)
      });
    } else
      datasets.forEach(e => tagSet.add(e.name));
    var tagArr = new Array();
    tagSet.forEach(e => tagArr.push(e))
    res.json(tagArr);
  } catch (e) {
    util.reportMessage(e,
      "E37: error during retrieval of dataset tags.", null, res);
  }
});



/**
 * @api {get} /dataset/docs GET specific documents based on filters
 * @apiName GetDocsTag
 * @apiUse DFHeader
 * @apiVersion 0.1.0  
 * @apiGroup Dataset
 * @apiParam {string} name Tag name User-defined unique Name. 
 * @apiParam {string} [startTime] The lower time-bound of requested data as an ISO-formatted date (UTC)
 * @apiParam {string} [endTime] The upper time-bound of requested data as an ISO-formatted date (UTC)
 * @apiParam {string} [relation] The relation with the start and end time; overlap = dataset needs to overlap partially with the time range, inner = dataset needs to be within time range (default)
 * @apiParam {Number} [jobId] Get all the data associated with a jobID/run
 * @apiExample {curl} Example usage:
 *      curl -i http://baseURL/dataset/docs?name=CAM-TS-01:MultiCoat.W3_FRN_02&startTime=2019-05-21 20:00:00.000&endTime=2019-05-22T23:59:59.710Z
 */
router.get('/docs',[check('name').isString().exists()], jwtPassport.isAuthorized, async function (req, res, next) {
  try {
    var err = validationResult(req);
    if(!err.isEmpty())
        throw new Error(JSON.stringify(err.mapped()));

    var _dataset = null;
    let _value= null;

    // Get datasets that match name
    if(req.query.startTime == undefined && req.query.endTime == undefined) 
        _dataset = await util.getModel()["Dataset"].find({"name": req.query.name});
    // Get datasets within startTime and endTime time and match name
    else if(req.query.startTime != undefined && req.query.endTime != undefined){ 

        var strt    = new Date(req.query.startTime);
        var endTime = new Date(req.query.endTime);
        
        if(req.query.relation != undefined && req.query.relation == 'overlap')
            _dataset = (await util.getModel()["Dataset"]
            .find( { 'name' : req.query.name, $and: [ {'endTime': { $gte: strt }}, {'startTime': { $lte: endTime }}] })
            .sort( {startTime: 1}));
        else
            _dataset = (await util.getModel()["Dataset"]
            .find( { 'name' : req.query.name, 'startTime': { $gte: strt }, 'endTime': { $lte: endTime} })
            .sort( {startTime: 1}));

    
    }else if(req.query.startTime != undefined){ // Right open interval 
        var strt = new Date(req.query.startTime);
        
        _dataset = (await util.getModel()["Dataset"].find( { 'name' : req.query.name, 'startTime': { $gte: strt } }).sort( {startTime: 1}));
   
    }else if(req.query.endTime != undefined){ // Left open interval
        var endTime = new Date(req.query.endTime);
        
        _dataset = (await util.getModel()["Dataset"].find( { 'name' : req.query.name, 'endTime': { $lte: endTime} }).sort( {startTime: 1}));
   
    
    }else if(req.query.jobid != undefined){ // Get datasets that overlap with runId

        var _job = await util.getModel()["Job"].findById( req.query.jobid );
        var strt = new Date(_job.startTime);
        var endTime = new Date(_job.endTime);

        // Get Dataset for timeperiod
        _dataset = (await util.getModel()["Dataset"].find( { 'name' : req.query.name, $and: [ {'endTime': { $gte: strt }}, {'startTime': { $lte: endTime }}] }). sort( {startTime: 1}));
        
        let lastv= _dataset[0].lastData;
        console.log(lastv);

        // Get value
        _value = (await util.getModel()["Dataset"].find( { 'lastData:' : _id, values: {$slice: -1}  }));

        console.log(`ID: ${_dataset} Value, ${_value}`);
    }else
        throw new Error("Not eneought parameters provided");

    if(_dataset != null)
        res.json(_dataset);

 
  } catch (e) {
    util.reportMessage(e, "E38: error during GET from datadocuments data.", null, res);
  }
});




/**
 * @api {get} /dataset/curdat GET specific data based on passed dataset
 * @apiName dataset/curdat
 * @apiUse DFHeader
 * @apiVersion 0.1.0  
 * @apiGroup Dataset
 * @apiParam {string} name Tag name User-defined unique Name. 

 * @apiExample {curl} Example usage:
 *      curl -i http://baseURL/dataset/docs?name=CAM-TS-01:MultiCoat.W3_FRN_02
 * 
 * The purpose is to get the latest dataset that has the latest value.

*/
//router.get('/curdata',[check('name').isString().exists()], jwtPassport.isAuthorized, async function (req, res, next) {
router.get('/curdata',[check('name').isString().exists()], async function (req, res, next) {
    // Show query
    console.log(`Curdata ${JSON.stringify(req.query, null,2)}`)

  try {
    // check validation string for name
    let err = validationResult(req);
    if(!err.isEmpty())
      console.log(JSON.stringify(err.mapped()));

    let _dataset = null;
    _dataset= await awaitGetData(req);
    
    // add mongoose direct - eliminate the util
    // _dataset = await mongoose.model('dataset').find('query' in req ? req.query : {}).populate([
    //         {path: 'startTime'}, {path: 'firstData'}]);

    if( _dataset != null) {
        // We need to get the dataset id that will have the last data id of values
        let dataset_id =  _dataset[0].lastData;
        console.log(`lastdata: ${dataset_id }`)
        curValue= await awaitGetValue(dataset_id );
        res.json(curValue);
    }

  } catch (e) {
    util.reportMessage(e, "E38: error during GET from datadocuments data.", null, res);
  }
});

// Make an aync function, mongoose uses promises
async function awaitGetData(req) {
    try {
      console.log(`Mongoose call to Dataset name:${req.query.name}`);
      const dataset = await mongoose.model('dataset').find({name: req.query.name}).sort({startTime: -1}).limit(1).exec();
      //const dataset = await mongoose.model('dataset').findOne({name: req.query.name}).exec();
      console.log(`Curdata ${JSON.stringify(dataset)}`)
      return(dataset);
    }
    catch (err) {
        console.log(`Can NOT find dataset ${err}`);
    }
  }


  // Make an aync function, mongoose uses promises
  // db.data.find({_id: ObjectId("642d719a01edda0714f21abb")}, {values: {$slice: -1}}).pretty()
async function awaitGetValue(id) {
    try {
      console.log(`Mongoose call to Value: ${id}`);
      //const valdata = await mongoose.model('data').find({id: _id}, {values: {$slice: -1}} ).exec();

      const valdata = await mongoose.model('data').find({ _id: id}, {values: {$slice: -1}} ).exec();
      if(valdata.length > 0 ) {
        console.log(`Curvalue ${JSON.stringify(valdata)}`)
      }
      else  console.log(`No Data for: ${id}`)

      return(valdata);
    }
    catch (err) {
        console.log(`Can NOT find dataset ${err}`);
    }
  }

/**
 * @api {delete} /dataset/:id DELETE dataset and all data by dataset document ID
 * @apiName DeleteDataset
 * @apiUse DFHeader
 * @apiVersion 0.1.0
 * @apiGroup Dataset
 * @apiParam {String} id URL parameter, 24-character Mongo ID of the dataset document.
 */
router.delete('/:id', async function(req, res, next){
   try{ 

        var dataset = await util.getModel()["Dataset"].findById( req.params.id );
        if(dataset === null)
            throw new Error("Can NOT find dataset");
        var strt = dataset.startTime;
        var end = dataset.endTime;

        var dsArray = [ mongoose.Types.ObjectId(req.params.id) ];
        // Create pipeline to search for all relevant data documents
        var pipeline = [
            {$match: {$and: [ {dataset: {$in: dsArray}}, {startTime: {$gte: strt, $lte: end}} ] }},
            {$sort: {"dataset": 1, "startTime" : 1, "_id": 1}},
            {$project: {"_id" : 1}}];

        var foundData = [];

        var dataTag = await util.getModel()["Dictionary"]["tagDocument"].findById(dataset.dataTagID);


        // Get Data with pipeline
        if(dataTag.dataTagType === 'timeseries')
            foundData = (await util.getModel()["Data"].aggregate(pipeline).allowDiskUse(true));
        else if(dataTag.dataTagType === 'continuous')
            foundData = (await util.getModel()["ContinuousData"].aggregate(pipeline).allowDiskUse(true));
        else if(dataTag.dataTagType === 'spectrum')
            foundData = (await util.getModel()["SpectrumData"].aggregate(pipeline).allowDiskUse(true));
        // Delete each document in array
        for(var i = 0; i < foundData.length; i++){
            if(dataTag.dataTagType === 'timeseries')
                (await util.getModel()["Data"].findByIdAndRemove(foundData[i]._id));
            else if(dataTag.dataTagType === 'continuous')
                (await util.getModel()["ContinuousData"].findByIdAndRemove(foundData[i]._id));
            else if(dataTag.dataTagType === 'spectrum')
                (await util.getModel()["SpectrumData"].findByIdAndRemove(foundData[i]._id));
        }

        // Delete dataset document
        await util.getModel()["Dataset"].findByIdAndRemove( dataset._id );

        res.json({ success: true, message: "Delete dataset records"});
    } catch (e) {
        util.reportMessage(e, "E38: error during DELETE dataset.", null, res);
    }

});


module.exports = router;

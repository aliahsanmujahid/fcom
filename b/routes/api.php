<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OtpSendController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\BdAddressController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReviewController;

Route::post('/sendotp', [OtpSendController::class, 'sendOtp'])
    ->middleware('ifisAuth');
Route::post('/otpsendagain', [OtpSendController::class, 'otpsendagain'])
    ->middleware('ifisAuth');
Route::post('/imageupload', [ImageController::class, 'imageUpload'])
    ->middleware('ifisAuth');
Route::post('/deleteimage', [ImageController::class, 'deleteImage'])
->middleware('ifisAuth');
Route::post('/getimagefile', [ImageController::class, 'getImageFile'])
->middleware('ifisAuth');
Route::post('/getbdaddress', [BdAddressController::class, 'getbdaddress'])
->middleware('ifisAuth');
Route::post('/getcategories', [CategoryController::class, 'getCategories'])
->middleware('ifisAuth');
Route::post('/createcate', [CategoryController::class, 'createCate'])
->middleware('isAuth');
Route::post('/createsubcate', [CategoryController::class, 'createSubcate'])
->middleware('isAuth');
Route::post('/getallcate', [CategoryController::class, 'getAllCate'])
->middleware('ifisAuth');
Route::post('/getsubcatebyid', [CategoryController::class, 'getSubCateById'])
->middleware('ifisAuth');
Route::post('/deletecate', [CategoryController::class, 'deleteCate'])
->middleware('isAuth');
Route::post('/deletesubcate', [CategoryController::class, 'deleteSubCate'])
->middleware('isAuth');

Route::post('/getallreport', [DashboardController::class, 'getallReport'])
    ->middleware('isAuth');
Route::post('/livereport', [DashboardController::class, 'liveReport'])
    ->middleware('isAuth');    

Route::post('/sendalltodelivery', [OrderController::class, 'sendAllToDelivery'])
    ->middleware('isAuth'); 
Route::post('/changestatus', [OrderController::class, 'changeStatus'])
    ->middleware('isAuth'); 
Route::post('/ordercancel', [OrderController::class, 'orderCancel'])
    ->middleware('isAuth');         
Route::post('/setallorderstatus', [OrderController::class, 'setAllOrderStatus'])
    ->middleware('isAuth'); 
Route::post('/orderreturn', [OrderController::class, 'orderReturn'])
    ->middleware('isAuth'); 
Route::post('/createorder', [OrderController::class, 'createOrder'])
    ->middleware('isAuth'); 
Route::post('/getorders', [OrderController::class, 'getOrders'])
    ->middleware('isAuth'); 
Route::post('/getcustomerorders', [OrderController::class, 'getCustomerOrders'])
    ->middleware('isAuth'); 
Route::post('/basketcheckset', [OrderController::class, 'basketCheckSet'])
    ->middleware('ifisAuth'); 
Route::post('/getbasket', [OrderController::class, 'getBasket'])
    ->middleware('ifisAuth'); 
Route::post('/deletecart', [OrderController::class, 'deleteCart'])
    ->middleware('ifisAuth'); 
Route::post('/getorderforreturnmanage', [OrderController::class, 'getOrderForReturnManage'])
    ->middleware('isAuth'); 
Route::post('/manageorderitemsreturn', [OrderController::class, 'manageOrderItemsReturn'])
    ->middleware('isAuth');                             

    
 

Route::post('/paymentcreate', [PaymentController::class, 'paymentCreate'])
    ->middleware('isAuth');
Route::post('/szstatus', [PaymentController::class, 'szStatus']);  
Route::post('/fail', [PaymentController::class, 'fail']);  
Route::post('/settxn', [PaymentController::class, 'settxn']);  
Route::post('/txnconfirm', [PaymentController::class, 'txnconfirm']);  


Route::post('/getoffers', [ProductController::class, 'getOffers'])
    ->middleware('isAuth');  
Route::post('/loadmoreoffer', [ProductController::class, 'loadMoreOffer'])
    ->middleware('isAuth');  
Route::post('/getproducts', [ProductController::class, 'getProducts'])
    ->middleware('isAuth');  
Route::post('/productactiveinactive', [ProductController::class, 'productActiveInactive'])
    ->middleware('isAuth');  
Route::post('/addremovefav', [ProductController::class, 'addRemoveFav'])
    ->middleware('isAuth');  
Route::post('/getallproductslist', [ProductController::class, 'getAllProductsList'])
->middleware('ifisAuth');
Route::post('/getallproducts', [ProductController::class, 'getAllProducts'])
->middleware('ifisAuth');
Route::post('/getvari', [ProductController::class, 'getVari'])
->middleware('ifisAuth');  
Route::post('/geteditproduct', [ProductController::class, 'getEditProduct'])
    ->middleware('isAuth');  
Route::post('/getsingleproduct', [ProductController::class, 'getSingleProduct'])
    ->middleware('ifisAuth'); 
Route::post('/getrelatedproducts', [ProductController::class, 'getRelatedProducts'])
->middleware('ifisAuth');
Route::post('/createupdateproduct', [ProductController::class, 'createUpdateProduct'])
    ->middleware('isAuth');                                                             
Route::post('/deleteproduct', [ProductController::class, 'deleteProduct'])
    ->middleware('isAuth');                                                             
Route::post('/createeditanswerquestion', [ProductController::class, 'createEditAnswerQuestion'])
    ->middleware('isAuth');                                                             
Route::post('/getallproductquestion', [ProductController::class, 'getAllProductQuestion'])
    ->middleware('isAuth');                                                             
Route::post('/getproductquestions', [ProductController::class, 'getProductQuestions'])
    ->middleware('isAuth');                                                             
Route::post('/getmanagequestions', [ProductController::class, 'getManageQuestions'])
    ->middleware('isAuth');                                                             
Route::post('/getmanagebasket', [ProductController::class, 'getManageBasket'])
    ->middleware('isAuth');                                                             
Route::post('/updateviews', [ProductController::class, 'updateViews'])
    ->middleware('isAuth');                                                             
Route::post('/loadmorequestions', [ProductController::class, 'loadMoreQuestions'])
    ->middleware('isAuth');    
    
    
Route::post('/userreport', [ReportController::class, 'userReport'])
    ->middleware('isAuth'); 
Route::post('/orderreport', [ReportController::class, 'orderReport'])
    ->middleware('isAuth');                                                             
Route::post('/productviewreport', [ReportController::class, 'productViewReport'])
    ->middleware('isAuth'); 
    
    
Route::post('/rchangestatus', [ReviewController::class, 'rchangestatus'])
    ->middleware('isAuth');                                                             
Route::post('/setallreviewstatust', [ReviewController::class, 'setallreviewstatust'])
    ->middleware('isAuth');                                                             
Route::post('/createreview', [ReviewController::class, 'createreview'])
    ->middleware('isAuth');                                                             
Route::post('/updatereview', [ReviewController::class, 'updatereview'])
    ->middleware('isAuth');                                                             
Route::post('/getallreviews', [ReviewController::class, 'getallreviews'])
    ->middleware('isAuth');
Route::post('/getreview', [ReviewController::class, 'getreview'])
    ->middleware('isAuth');                                                             
Route::post('/answerreview', [ReviewController::class, 'answerReview'])
    ->middleware('isAuth');                                                             
Route::post('/getreviewsformanage', [ReviewController::class, 'getReviewsForManage'])
    ->middleware('isAuth');  

Route::post('/createcoupon', [SettingController::class, 'createCoupon'])
    ->middleware('isAuth');    
Route::post('/updatecoupon', [SettingController::class, 'updateCoupon'])
    ->middleware('isAuth');  
Route::post('/getallcoupons', [SettingController::class, 'getAllCoupons'])
    ->middleware('isAuth');                                                             
Route::post('/deletecoupon', [SettingController::class, 'deleteCoupon'])
    ->middleware('isAuth');                                                             
Route::get('/updatecron', [SettingController::class, 'updateCron']);                                                             
Route::post('/createupdatesitecontent', [SettingController::class, 'createUpdateSiteContent'])
    ->middleware('isAuth');  
Route::post('/getsitemanage', [SettingController::class, 'getSiteManage'])
    ->middleware('isAuth');                                                             
Route::post('/createupdatedelivery', [SettingController::class, 'createUpdateDelivery'])
    ->middleware('isAuth');                                                             
Route::post('/getdelivery', [SettingController::class, 'getDelivery'])
    ->middleware('isAuth');                                                             
Route::post('/createpage', [SettingController::class, 'createPage'])
    ->middleware('isAuth');  
Route::post('/getpages', [SettingController::class, 'getPages'])
    ->middleware('isAuth');  
Route::post('/deletepage', [SettingController::class, 'deletePage'])
    ->middleware('isAuth');      
Route::post('/pageaction', [SettingController::class, 'pageAction'])
    ->middleware('isAuth');    
Route::post('/createsitemanage', [SettingController::class, 'createSiteManage'])
    ->middleware('isAuth');                                                             
Route::post('/updatesitemanage', [SettingController::class, 'updateSiteManage'])
    ->middleware('isAuth');                                                             
Route::post('/getsitecontent', [SettingController::class, 'getSiteContent'])
->middleware('ifisAuth');                                                         


Route::post('/autosignup', [UserController::class, 'autosignup'])
->middleware('ifisAuth');
Route::post('/updateuser', [UserController::class, 'updateUser'])
->middleware('ifisAuth');
Route::post('/getuserinfo', [UserController::class, 'getUserInfo'])
->middleware('ifisAuth');
Route::post('/createadminuser', [UserController::class, 'createAdminUser'])
->middleware('ifisAuth');
Route::post('/searchuser', [UserController::class, 'searchUser'])
->middleware('ifisAuth');
Route::post('/setadminmoderator', [UserController::class, 'setAdminModerator'])
->middleware('ifisAuth');
Route::post('/getuserscountbyrole', [UserController::class, 'getUsersCountByRole'])
->middleware('ifisAuth');
Route::post('/activeupdate', [UserController::class, 'activeUpdate'])
->middleware('ifisAuth');

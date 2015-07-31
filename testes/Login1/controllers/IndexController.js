var IndexController={
	index:function(req,res){
		res.render('index',{title: 'Express'});
	}
};

module.exports=IndexController;

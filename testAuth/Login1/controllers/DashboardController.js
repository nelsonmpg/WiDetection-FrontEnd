var DashboardController={
	index:function(req,res){
		// o passport automaticamente coloca na requisi��o o usu�rio logado
		res.render('dashboard', {user: req.user});
	}
};

module.exports=DashboardController;

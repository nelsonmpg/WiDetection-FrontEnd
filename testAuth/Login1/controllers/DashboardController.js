var DashboardController={
	index:function(req,res){
		// o passport automaticamente coloca na requisição o usuário logado
		res.render('dashboard', {user: req.user});
	}
};

module.exports=DashboardController;

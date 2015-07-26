module.exports=function(req,res,next){
	if(req.isAuthenticated()){
		// avan�a para a pr�xima fun��o da rota, que ser� a fun��o principal.
		return next();
	}else{
		// avan�a para a pr�xima ROTA. Como n�o existe uma rota encadeada nem um redirect, 
		// a pr�xima rota � a 404 (page not found), que serve para os nossos prop�sitos de bloqueio. 
		return next('route');
	}
};

var passport=require('passport');

var LoginController={
	/* GERAL */
	
	signout: function(req,res){
		req.logout(); // já fornecida pelo passport
		res.redirect('/'); // redireciona para a raiz.
	},
	
	/* LOCAL AUTH */
	
	signin:function(req,res){
		res.render('signin',{ message: req.flash('signinMessage') });
	},

	signup:function(req,res){
		res.render('signup', { message: req.flash('signupMessage') });
	},

	cadastroUsuario:passport.authenticate('local-signup',{
		successRedirect: '/dashboard', // em caso de sucesso, redirecione para esta rota.
		failureRedirect: '/local/signup', // Em caso de falha, redirecione para esta rota
		failureFlash: true, //allow flash message
	}),

	login:passport.authenticate('local-signin',{
		successRedirect:'/dashboard',
		failureRedirect:'/local/signin',
		failureFlash: true
	}),
	
	localLink:function(req,res){
		res.render('addAccount');
	},
	
	linkAccount:passport.authenticate('local-signup',{
		successRedirect:'/dashboard',
		failureRedirect:'/local/link',
	}),
	
	unlinkAccount:function(req,res){
		var _user=req.user;
		_user.auth.local.email=undefined;
		_user.save(function(err){
			if(err) throw err;
			
			res.redirect('/dashboard');
		});
	},

	/* TWITTER AUTH */

	twitterConnect: passport.authenticate('twitter', {scope: 'email'}),

	twitterCallback: passport.authenticate('twitter', {
		successRedirect: '/dashboard',
		failureRedirect: '/',
	}),
	
	linkTwitter:passport.authorize('twitter', {scope: 'email'}),
	
	linkTwitterCallback:passport.authorize('twitter', {
		successRedirect:'/dashboard',
		failureRedirect:'/',
	}),
	
	unlinkTwitter:function(req,res){
		var _user=req.user;
		
		_user.auth.twitter.id=undefined;
		_user.save(function(err){
			if(err) throw err;
			
			res.redirect('/dashboard');
		});
	},
	
	/* GOOGLE AUTH */
	
	googleConnect:passport.authenticate('google', {scope:['profile', 'email']}),
	
	googleCallback: passport.authenticate('google',{
		successRedirect:'/dashboard',
		failureRedirect:'/',
	}),
	
	googleLink: passport.authorize('google', {scope:['profile', 'email']}),
	
	googleLinkCallback: passport.authorize('google', {
		successRedirect:'/dashboard',
		failureRedirect:'/',
	}),
	
	googleUnlink: function(req,res){
		var user=req.user;
		user.auth.google.token=undefined;
		user.auth.google.id=undefined;
		user.save(function(err){
			if(err) throw err;
			
			res.redirect('/dashboard');
		});
	},
	
	/* FACEBOOK AUTH */
	
	facebookConnect:passport.authenticate('facebook', { scope: 'email' }),
	
	facebookCallback: passport.authenticate('facebook',{
		successRedirect:'/dashboard',
		failureRedirect:'/',
	}),
	
	facebookLink: passport.authorize('facebook', { scope: 'email' }),
	
	facebookLinkCallback: passport.authorize('facebook', {
		successRedirect:'/dashboard',
		failureRedirect:'/',
	}),
	
	facebookUnlink: function(req,res){
		var user=req.user;
		user.auth.facebook.token=undefined;
		user.auth.facebook.id=undefined;
		user.save(function(err){
			if(err) throw err;
			
			res.redirect('/dashboard');
		});
	},
};

module.exports=LoginController;
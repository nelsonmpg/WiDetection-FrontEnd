var User=require('../models/User');

var LocalStrategy=require('passport-local').Strategy;
var TwitterStrategy=require('passport-twitter').Strategy;
var GoogleStrategy=require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy=require('passport-facebook').Strategy;
var config=require('../config/config');

module.exports=function(passport){
	/*
	 * Estas configura��es permitem o login consistente e permamente
	 */
	passport.serializeUser(function(user,done){
		done(null,user.id);
	});

	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err,user);
		});
	});
	
	/***********************
	 ***** 	LOCAL AUTH *****
	 ***********************/

	// Setup do m�dulo passport-local, que � chamado de estrat�gia. Como o passport suporta v�rios 
	// tipos de configura��es e abordagens diferentes, � recomend�vel nomear as estrat�gias.
	// Para a estrat�gia local, utilizaremos os nomes 'local-signup' e 'local-signin'
	
	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
		}, function(req,email,password,done){
		// � recomend�vel que todo o procedimento seja feito de forma ass�ncrona
		process.nextTick(function(){
			/*
			 * Verificando se o usu�rio j� est� cadastrado
			 */
			if(!req.user){
				User.findOne({'auth.local.email':email}, function(err,user){
					if(err) done(err);
					// se o usu�rio existir, exibe uma mensagem de erro.
					if(user){
						return done(null, false, req.flash('signupMessage', 'Usu�rio j� cadastrado.'));
					}else{
						// caso contr�rio, crie o novo usu�rio.
						var newUser=new User();
						newUser.auth.local.email=email;
						newUser.auth.local.password=newUser.generateHash(password); // a senha deve ser encriptada antes da grava��o no banco.
	
						newUser.save(function(err){
							if(err) throw err;
	
							return done(null, newUser, req.flash('signupMessage', 'Usu�rio cadastrado com sucesso.'));
						});
					}
				});
			}else{
				//atualizar o usu�rio com os dados novos.
				var _user=req.user;
				_user.auth.local.email=email;
				_user.auth.local.password=_user.generateHash(password);

				_user.save(function(err){
					if(err) throw err;

					return done(null, _user, req.flash('signupMessage', 'Usu�rio atualizado.'));
				});
			}			
		});
	})); // fim da estrat�gia para o signup.

	passport.use('local-signin', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, function(req,email,password,done){
		User.findOne({'auth.local.email':email}, function(err,user){
			if(err) return done(err);

			if(!user) return done(null, false, req.flash('signinMessage', 'Usu�rio n�o encontrado'));

			if(!user.checkPassword(password)) return done(null, false, req.flash('signinMessage', 'Senha incorreta'));

			return done(null, user);
		});
	}));
	
	/************************
	 ***** TWITTER AUTH *****
	 ************************/

	passport.use(new TwitterStrategy({
		consumerKey: config.secret.twitter.consumer_key,
		consumerSecret: config.secret.twitter.consumer_secret,
		callbackURL: config.secret.twitter.callback_url,
		passReqToCallback: true,
	}, function(req,token, tokenSecret, profile, done){
		process.nextTick(function(){
			console.log("Estou no twitter");
			if(!req.user){
				User.findOne({'auth.twitter.id':profile.id}, function(err, user){
					if(err) return done(err);
					if(user){
						return done(null, user);
					}else{
						var newUser=new User();
						newUser.auth.twitter.id=profile.id;
						newUser.auth.twitter.token=token;
						newUser.auth.twitter.username=profile.username;
						newUser.auth.twitter.displayName=profile.displayName;

						newUser.save(function(err){
							if(err) throw err;

							return done(null, newUser)
						});
					}
				});
			}else{
				var _user=req.user;
				
				_user.auth.twitter.id=profile.id;
				_user.auth.twitter.token=token;
				_user.auth.twitter.username=profile.username;
				_user.auth.twitter.displayName=profile.displayName;
				
				_user.save(function(err){
					if(err) throw err;
					
					return done(null, _user);
				});
			}			
		});
	}));
	
	/***********************
	 ***** GOOGLE AUTH *****
	 ***********************/
	
	passport.use(new GoogleStrategy({
		clientID:config.secret.google.consumer_key,
		clientSecret:config.secret.google.consumer_secret,
		callbackURL:config.secret.google.callback_url,
		passReqToCallback:true,
	}, function(req, token, refreshToken, profile, done){
		process.nextTick(function(){
			console.log(profile);
			if(!req.user){
				User.findOne({'auth.google.id': profile.id}, function(err,user){
					if(err) return done(err);
					
					if(user){
						return done(null, user);
					}else{
						var newUser=new User();
						newUser.auth.google.id=profile.id;
						newUser.auth.google.token=token;
						newUser.auth.google.email=profile.emails[0].value;
						newUser.auth.google.name=profile.displayName;
						
						newUser.save(function(err){
							if(err) return done(err);
							
							return done(null, newUser);
						});
					}
				});
			}else{
				var _user=req.user;
				
				_user.auth.google.id=profile.id;
				_user.auth.google.token=token;
				_user.auth.google.email=profile.emails[0].value;
				_user.auth.google.name=profile.displayName;
				
				_user.save(function(err){
					if(err) return done(err);
					
					return done(null, _user);
				});
			}
		});
	}));
	
	/*************************
	 ***** FACEBOOK AUTH *****
	 *************************/
	 
	 passport.use(new FacebookStrategy({
		clientID: config.secret.facebook.consumer_key,
		clientSecret: config.secret.facebook.consumer_secret,
		callbackURL: config.secret.facebook.callback_url,
		passReqToCallback: true,
	}, function(req,token, refreshToken, profile, done){
		process.nextTick(function(){
			if(!req.user){
				User.findOne({'auth.facebook.id':profile.id}, function(err, user){
					if(err) return done(err);
					if(user){
						return done(null, user);
					}else{
						var newUser=new User();
						newUser.auth.facebook.id=profile.id;
						newUser.auth.facebook.token=token;
						newUser.auth.facebook.email=profile.emails[0].value;
						newUser.auth.facebook.name=profile.name.givenName+' '+profile.name.familyName;

						newUser.save(function(err){
							if(err) throw err;

							return done(null, newUser)
						});
					}
				});
			}else{
				var _user=req.user;
				
				_user.auth.facebook.id=profile.id;
				_user.auth.facebook.token=token;
				_user.auth.facebook.email=profile.emails[0].value;
				_user.auth.facebook.name=profile.name.givenName+' '+profile.name.familyName;
				
				_user.save(function(err){
					if(err) throw err;
					
					return done(null, _user);
				});
			}			
		});
	}));
};

module.exports={
	// Caso o método da rota seja diferente de GET, utilizar o nome do método antes da rota (Ex: 'POST /nome/nome2')
	
	/* ROTAS GERAIS */
	
	'/':{
		controller:'IndexController',
		action:'index',
	},
	
	'/dashboard':{
		controller:'DashboardController',
		action:'index',
		policy:'isAuthenticated',
	},

	'/signout':{
		controller:'LoginController',
		action:'signout',
		policy:'isAuthenticated',
	},
	
	/* LOCAL AUTH */

	'/local/signin':{
		controller:'LoginController',
		action:'signin',
	},

	'/local/signup':{
		controller:'LoginController',
		action:'signup',
	},

	'POST /local/signup':{
		controller:'LoginController',
		action:'cadastroUsuario',
	},

	'POST /local/signin':{
		controller:'LoginController',
		action:'login',
	},
	
	'/local/link':{
		controller:'LoginController',
		action:'localLink',
		policy:'isAuthenticated',
	},

	'POST /local/link':{
		controller:'LoginController',
		action:'linkAccount',
		policy:'isAuthenticated',
	},

	'/local/unlink':{
		controller:'LoginController',
		action:'unlinkAccount',
		policy:'isAuthenticated',
	},

	/* TWITTER AUTH */
	 
	'/twitter/connect':{
		controller:'LoginController',
		action:'twitterConnect',
	},

	'/twitter/callback':{
		controller:'LoginController',
		action:'twitterCallback',
	},

	'/twitter/link':{
		controller:'LoginController',
		action:'linkTwitter',
		policy:'isAuthenticated',
	},
	
	'/twitter/link/callback':{
		controller:'LoginController',
		action:'linkTwitterCallback',
		policy:'isAuthenticated',
	},
	
	'/twitter/unlink':{
		controller:'LoginController',
		action:'unlinkTwitter',
		policy:'isAuthenticated',
	},
	
	/* GOOGLE AUTH */
	
	'/google/connect':{
		controller:'LoginController',
		action:'googleConnect',
	},
	
	'/google/callback':{
		controller:'LoginController',
		action:'googleCallback',
	},
	
	'/google/link':{
		controller:'LoginController',
		action:'googleLink',
		policy:'isAuthenticated',
	},
	
	'/google/link/callback':{
		controller:'LoginController',
		action:'googleLinkCallback',
		policy:'isAuthenticated',
	},
	
	'/google/unlink':{
		controller:'LoginController',
		action:'googleUnlink',
		policy:'isAuthenticated',
	},
	
	/* FACEBOOK AUTH */
	
	'/facebook/connect':{
		controller:'LoginController',
		action:'facebookConnect',
	},
	
	'/facebook/callback':{
		controller:'LoginController',
		action:'facebookCallback',
	},
	
	'/facebook/link':{
		controller:'LoginController',
		action:'facebookLink',
		policy:'isAuthenticated',
	},
	
	'/facebook/link/callback':{
		controller:'LoginController',
		action:'facebookLinkCallback',
		policy:'isAuthenticated',
	},
	
	'/facebook/unlink':{
		controller:'LoginController',
		action:'facebookUnlink',
		policy:'isAuthenticated',
	},
};
(function (exports) {
	exports.Utilities = {

		getToken: function() {
			return $('meta[name=_token]').attr('content');
		},

		getUserType: function() {
			var user_type = laravel.role;

	        if (user_type == null) {
	            user_type = 1;
	        }

			return user_type;
		},

	};
})(window);

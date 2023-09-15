const Maho = {
	ucwords	: (str) => {
		return str.toLowerCase().replace(/\b[a-z]/g, function(letter) {
			return letter.toUpperCase();
		});
	},
	number : (num, dec, dot, comma) => {
		if(isNaN(dec)) dec = 0;
		if(typeof dot != 'string' || dot.length == 0) dot = '.';
		if(typeof comma != 'string' || comma.length == 0) comma = ',';
		const nums = Math.round(num, dec).toString().split(dot);
		const left = nums[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, comma);
		if(dec <= 0) {
			return left;
		}
		var decimals = typeof nums[1] != 'undefined' ? nums[1] : '0'; 
		while(decimals.length < dec) {
			decimals = decimals + '0';
		}
		return left + '.' + decimals;
	},
	nl2br : (str, is_xhtml) => {
	    if (typeof str === 'undefined' || str === null) {
	        return '';
	    }
	    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
	    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
	}
}
export default Maho;
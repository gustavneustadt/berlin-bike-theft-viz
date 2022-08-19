<script lang="ts" context="module">
	export const clamp = function(num: number, min: number, max: number) {
			return Math.min(Math.max(num, min), max);
		}
	
	// attach the .equals method to Array's prototype to call it on any array
	export const arrayEquals = function (arrayA: number[]|any[], arrayB: number[]|any[]) {
		// if the other array is a falsy value, return
		if (!arrayA)
			return false;
	
		// compare lengths - can save a lot of time 
		if (arrayB.length != arrayA.length)
			return false;
	
		for (var i = 0, l=arrayB.length; i < l; i++) {
			// Check if we have nested arrays
			if (arrayB[i] instanceof Array && arrayA[i] instanceof Array) {
				// recurse into the nested arrays
				if (!arrayB[i].equals(arrayA[i]))
					return false;       
			}           
			else if (arrayB[i] != arrayA[i]) { 
				// Warning - two different object instances will never be equal: {x:20} != {x:20}
				return false;   
			}           
		}       
		return true;
	}
</script>
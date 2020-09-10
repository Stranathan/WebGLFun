var meshLoadStatus = null;

// file path is a string
function loadMesh(filePath) 
{

	var xhttp = new XMLHttpRequest();
	console.log("before onreadystatechange");
	xhttp.onreadystatechange = function() 
	{
		console.log("during onreadystatechange");

		//	4: request finished and response is ready
		//	200: "OK"
		if (this.readyState == 4 && this.status == 200) 
		{
			meshLoadStatus = 1;
			parseMeshString(String(this.responseText));
		}
	};
	xhttp.open("GET", filePath, true);
	xhttp.send();

	// return 
	// {
	// 	name: name,
	// 	totalScore: totalScore,
	// 	gamesPlayed: gamesPlayed
	// };
}

function parseMeshString(objString)
{
	console.log(objString);
}
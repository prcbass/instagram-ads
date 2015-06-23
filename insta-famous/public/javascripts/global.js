//DOM Ready ======================================================
$(document).ready(function(){
	// Populate user table on initial page load
	populateTable();
});

//Functions =======================================================

function populateTable(){

	var tableContent = '';

	//jQuery AJAX call for JSON

	$.getJSON('/users/userlist', function(data){
		//For each item in JSON, add table row and cells to content string
		$.each(data, function(){
			tableContent += '<tr>';
			tableContent += '<td><div class="profPic"><img src="http://www.modern-english.co.uk/wp-content/uploads/Instagram-logo-005.png" alt="User Picture"></div></td>';
			tableContent += '<td>' + this.username + '</td>';
			tableContent += '<td>' + this.type + '</td>';
			tableContent += '</tr>';
		});

		$('#userList table tbody').html(tableContent);
	});
};
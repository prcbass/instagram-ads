/*
var api = require('instagram-node').instagram();

api.use({
	client_id: "3368cd2a15ec494383b2d21d0a28ff60",
    client_secret: "6cf80d749cf1474089d4908ca26b3dcd",
});
*/


//Global data array to hold user info
var userListData = [];
//DOM Ready ======================================================
$(document).ready(function(){
	// Populate user table on initial page load
	populateTable();

	//Add User button click
	$('#btnAddUser').on('click', addUser);

	//add DELETE User button click
	$('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
});

//Functions =======================================================

function populateTable(){

	var tableContent = '';

	//jQuery AJAX call for JSON

	$.getJSON('/users/userlist', function(data){
		//For each item in JSON, add table row and cells to content string
		$.each(data, function(){

			/*
			exports.followedBy = function(req,res){

				api.user(this.instaid, function(err, result, remaining, limit){
					tableContent += '<tr>';
					tableContent += '<td><div class="profPic"><img src="http://www.modern-english.co.uk/wp-content/uploads/Instagram-logo-005.png" alt="User Picture"></div></td>';
					tableContent += '<td>' + this.instaid + '</td>';
					tableContent += '<td>' + this.price + '</td>';
					tableContent += '<td> testData </td>';
					tableContent += '<td> testData </td>';
					tableContent += '<td><a href="#" class="linkdeleteuser" rel = "' + this._id + '">delete</a></td>';
					tableContent += '</tr>';
				});
			}
            */
			
			
			tableContent += '<tr>';
			tableContent += '<td><div class="profPic"><img src="http://www.modern-english.co.uk/wp-content/uploads/Instagram-logo-005.png" alt="User Picture"></div></td>';
			tableContent += '<td>' + this.instaid + '</td>';
			tableContent += '<td>' + this.price + '</td>';
			tableContent += '<td> testData </td>';
			tableContent += '<td> testData </td>';
			tableContent += '<td><a href="#" class="linkdeleteuser" rel = "' + this._id + '">delete</a></td>';
			tableContent += '</tr>';
			
			
			
		})

		$('#userList table tbody').html(tableContent);
	});
};

function addUser(event){
	event.preventDefault();

	var errorCount = 0;
	$('#addUser input').each(function(index,val){
		if($(this).val() === ''){errorCount++;}
	});

	if(errorCount === 0){
		var newUser = {
			"instaid" : $('#addUser fieldset input#inputInstaID').val(),
			"price" : $('#addUser fieldset input#inputUserPrice').val()
		}


		$.ajax({
			type: 'POST',
			data: newUser,
			url: '/users/adduser',
			dataType: 'JSON'
		}).done(function(response){
			//Blank response == successful 
			if(response.msg === ''){
				$('#addUser fieldset input').val('');

				populateTable();
			}
			else{
				alert('Error: ' + response.msg);
			}
		});
	}
	else{
		alert('Please fill in all fields');
		return false;
	}
};

function deleteUser(event){
	event.preventDefault();

	var confirmation = confirm('Are you sure you want to delete this user?');

	if(confirmation){
		$.ajax({
			type: 'DELETE',
			url: '/users/deleteuser/' + $(this).attr('rel')
		}).done(function(response){

			if(response.msg === ''){

			}else{
				alert('Error: ' + response.msg);
			}

			populateTable();
		});
	}
};
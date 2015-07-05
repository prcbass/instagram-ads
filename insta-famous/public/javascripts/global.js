//DOM Ready ============================================================
$(document).ready(function(){


	//Add DELETE user button click
	$('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
});

//Functions ============================================================

function deleteUser(event){
	event.preventDefault();

	var confirmation = confirm('Are you sure you want to delete this user?');

	if(confirmation){
		$.ajax({
			type: 'DELETE',
			url: '/deleteuser/' + $(this).attr('rel')
		}).done(function(response){
			if(response.msg != ''){
				window.location = response;
			}else{
				alert('Error: ' + response.msg);
			}
		});
	}
};

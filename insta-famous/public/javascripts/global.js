//DOM Ready ============================================================
$(document).ready(function(){

	//Add DELETE user button click
	$('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);

	//Add POST for checking which advertiser is selected
	$('#advertiserInput').click(checkPostAdvertisers);
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

function checkPostAdvertisers(event){
	event.preventDefault();

	var checkedAds = new Array();
	$(".advertiserCheck:checkbox:checked").each(function(){
		checkedAds.push($(this).attr("name"));
	})
	console.log("VALUE OF ARRAY: ", checkedAds);

	var selectedChecks = JSON.stringify(checkedAds);

	$.ajax({
		type: 'POST',
		dataType: "json",
		data: {result:selectedChecks},
		url: '/postadvertisers'
	}).done(function(response){
		if(response.msg != ''){
			//good to go
		}
		else{
			alert('Error: ' + response.msg);
		}
	});
};


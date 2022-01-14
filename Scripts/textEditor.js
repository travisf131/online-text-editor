
var jQueryXMLHttpRequest;
var currentFileContents;  // keeps track of the content of the currently selected file
var currentFile;          // keeps track the file that is currently loaded in the editor
var freshDocument = true; // boolean indicating whether the text is currently on the initial, "fresh" blank editor. 

$(document).ready(function () {
    // get file names and populate the dropdown select
    GetFileNames();

    // disable buttons by default
    $('.btn_Save').prop("disabled", true);
    $('.btn_SaveAs').prop("disabled", true);
});

// whenever a new file is selected from the dropdown, grab its file content, fill in the file name input, 
// set the fresh document flag to false, and disable "save as" -- we want to simply save pre-existing files
$(document).on('change', '.fileDropdown', function () {
    GetFileContent();
    UpdateFileNameInput();
    $('.btn_SaveAs').prop("disabled", true);
    freshDocument = false;
});

// whenever the text if the file name input is changes, we want to alter the button availability
$(document).on('keyup', '.fileNameInput', function () {

    // if the file name input was changed and is different than the selected file, disable Save, and enable Save As
    if ($('.fileNameInput').val() !== currentFile) {
        $('.btn_Save').prop("disabled", true);
        $('.btn_SaveAs').prop("disabled", false);
    }
    // otherwise, do the opposite since we would want to just save if the file text matches a pre-existing file
    else {
        $('.btn_Save').prop("disabled", false);
        $('.btn_SaveAs').prop("disabled", true);
    }

    // update the current file with the one selected. This will be used for future logic
    currentFile = $('.fileNameInput').val();
});


// handle what happens when the text in the text area is changed. Again, this mostly has to do
// with enabling and disabling the save buttons based on certain conditions
$(document).on('keyup', '.textSpace', function () {

    // if the text is different than the saved file contents, enable the save buttong
    // do this only if it is not a fresh document to prevent "Save" with new documents
    if ($('.textSpace').val() != currentFileContents && freshDocument == false) {
        $('.btn_Save').prop("disabled", false);
    }
    else {
        $('.btn_Save').prop("disabled", true);
    }

    // if it is a fresh document, or if the user returned back to "blank new file" we want to
    // enable the Save As button and disable Save
    if (freshDocument == true || $('.fileDropdown').val() == "Blank new file") {
        $('.btn_SaveAs').prop("disabled", false);
        $('.btn_Save').prop("disabled", true);
    }
});


/*
 * FUNCTION: GetFileContent()
 * DESCRIPTION: This funtion uses jQuerys' ajax method to make an AJAX call to the code behind file of the ASP.NET project.
 *              It sends a JSON string with the file parameter to the GetFileContent() function on the server-side, and 
 *              recieves back the contents of that file in JSON format. The JSON data is parsed, converted back to a string,
 *              and then displayed in the text area of the editor.
 *              It is also here where any user feedback messages are cleared and the global current file content variable 
 *              is updated with the contents retrieved.
 * PARAMETERS:  none
 * RETURN: none
 */
function GetFileContent() {

    var fileName = $('.fileDropdown').val();
    var jsonData = { file: fileName };
    var jsonString = JSON.stringify(jsonData);

    jQueryXMLHttpRequest = $.ajax({
        type: "POST",
        url: "startPage.aspx/GetFileContent",
        data: jsonString,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data != null && data.d != null) {
                var response;

                // parse the response data
                response = $.parseJSON(data.d);

                // convert the response data into a string, and then get each file name by splitting it into an array of strings
                var fileContent = String(response.content);

                $('.textSpace').val(fileContent);
            }

            $('.userFeedback').text("");

            // set the current loaded text so we can see if it's changed
            currentFileContents = fileContent;
        },
        fail: function () {
            $('.userFeedback').val("There was an error retrieving the file contents from that file :(")
        }
    });
}

/*
 * FUNCTION: GetFileNames()
 * DESCRIPTION: This funtion uses jQuerys' ajax method to make an AJAX call to the code behind file of the ASP.NET project.
 *              It sends a JSON string with the file parameter to the GetFileNames() function on the server side. The data 
 *              is sent back as a list of strings that was serialized as a JSON object. This string is parsed in order to
 *              obtain all of the file names in the directory.
 *              Once the array of file name strings is created, the file select dropdown is populated with <option>'s for
 *              each of the files sent back (only if they aren't already there).
 * PARAMETERS:  none
 * RETURN: none
 */
function GetFileNames() {

    var subdirectory = "/MyFiles";
    var jsonData = { directory: subdirectory };
    var jsonString = JSON.stringify(jsonData);

    jQueryXMLHttpRequest = $.ajax({
        type: "POST",
        url: "startPage.aspx/GetFileNames",
        data: jsonString,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data != null && data.d != null) {
                var response;

                // parse the response data
                response = $.parseJSON(data.d);

                // convert the response data into a string, and then get each file name by splitting it into an array of strings
                var fileNames = String(response).split(',');

                // store the list of files that were loaded from MyFiles, so we can detect new file names to SaveAs
                filesCurrentlyLoaded = fileNames;

                for (var i = 0; i < fileNames.length; i++) {

                    // check if the option already exists (we don't want to keep adding duplicate options)
                    var fileExists = $(".fileDropdown option[value='" + fileNames[i] + "']").length > 0;

                    // append an option to the dropdownlist
                    if (!fileExists) {
                        $('.fileDropdown').append($('<option>', {
                            value: fileNames[i],
                            text: fileNames[i],
                        }));
                    }
                }
            }
        },
        fail: function () {
            $('.userFeedback').val("There was an error retrieving the file data from the MyFiles directory.")
        }
    });
}

/*
 * FUNCTION: UpdateFileNameInput()
 * DESCRIPTION: This function is called everything the file select dropdown changes. It grabs the file name 
 *              selected and updates the file name text input to match. If the user selects "blank new file"
 *              then it keeps the text input blank. It also updates the current file with the selection. 
 * PARAMETERS:  none
 * RETURN: none
 */
function UpdateFileNameInput() {
    var fileName = $('.fileDropdown').val();
    if (fileName !== "Blank new file") {
        $('.fileNameInput').val(fileName);
    }
    else {
        $('.fileNameInput').val("");
    }
    currentFile = fileName;
}


/*
 * FUNCTION: SaveAsPopup()
 * DESCRIPTION: This function is called when the Save As button is called. It triggers a confirm window popup
 *              asking the user if they are sure they want to save the file. It also performs some validation 
 *              to make sure the file name text input isn't empty (we don't want to save a file with an empty)
 *              file name.
 * PARAMETERS:  none
 * RETURN: none
 */
function SaveAsPopup() {
    if ($('.fileNameInput').val() == "") {
        alert("You must enter a file name before saving!");
        return false;
    }
    else {
        return confirm("Are you sure you want to create a new file as " + $('.fileNameInput').val() + "?");
    }
}

/*
 * FUNCTION: SavePopup()
 * DESCRIPTION: This function is called when the Save button is called. It triggers a confirm window popup
 *              asking the user if they are sure they want to save the file and overwrite the current content
 *              of the file. It also performs validation on the file name text input to make sure it's not 
 *              empty
 * PARAMETERS:  none
 * RETURN: none
 */
function SavePopup() {
    if ($('.fileNameInput').val() == "") {
        alert("You must enter a file name before saving!");
        return false;
    }
    else {
        return confirm("Are you sure you want to overwrite the contents of " + $('.fileNameInput').val() + "?");
    }
}

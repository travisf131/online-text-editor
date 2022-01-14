using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Hosting;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using Newtonsoft.Json;

namespace textEditor
{
    public partial class _default : System.Web.UI.Page
    {
        private static List<string> FileNames = new List<string>();
        private static string FileStatus { get; set; }
        private static string FileContent { get; set; }

        /*
         * FUNCTION: btn_SaveAs_Click()
         * DESCRIPTION: This event handler grabs the file name from the file name input, and creates a new file
         *              with that name in the MyFiles directory. The user it notified whether this process succeeds or
         *              fails. The file is then filled with the text that is in the text area. 
         * PARAMETERS:  the default click event parameters
         * RETURN: void
         */
        protected void btn_SaveAs_Click(object sender, EventArgs e)
        {
            string fileName = fileNameInput.Text;
            string filepath = HttpContext.Current.Server.MapPath("MyFiles");
            filepath = filepath + @"\" + fileName;

            try
            {
                using (StreamWriter sw = File.CreateText(filepath))
                {
                    sw.Write(textSpace.Text);
                    userFeedback.Text = "File successfully created and saved!";
                }
            }
            catch (Exception)
            {
                userFeedback.Text = "There was an error saving this new file. Please try again. \n" +
                                    "You may have put in an invalid file name";
            }
        }

        /*
         * FUNCTION: btn_Save_Click()
         * DESCRIPTION: This event handler grabs the file name from the file name input, and writes the content
         *              of the text area to the file. The user is notified about the success of the file write.
         * PARAMETERS: the default click event parameters
         * RETURN: void
         */
        protected void SaveClick(object sender, EventArgs e)
        {
            string fileName = fileNameInput.Text;
            string filepath = HttpContext.Current.Server.MapPath("MyFiles");
            filepath = filepath + @"\" + fileName;

            try
            {
                File.WriteAllText(filepath, textSpace.Text);
                userFeedback.Text = "File successfully saved!";
            }
            catch (Exception)
            {
                userFeedback.Text = "There was a problem saving the file. Please try again";
            }
        }

        [WebMethod]
        /*
         * FUNCTION: GetFileNames()
         * DESCRIPTION: This function takes the directory to look in, grabs the names of all the files in that
         *              directory, and stores them in a list. The list is then converted into JSON and returned
         *              to the client making the call.
         * PARAMETERS: string of the directory name to look in in order to grab the file names. 
         * RETURN: void
         */
        public static string GetFileNames(string directory)
        {
            string[] filePaths = Directory.GetFiles(HostingEnvironment.ApplicationPhysicalPath + directory);
            foreach (string file in filePaths)
            {
                FileNames.Add(Path.GetFileName(file));
            }

            string returnData = JsonConvert.SerializeObject(FileNames);

            return returnData;
        }

        [WebMethod]
        /*
         * FUNCTION: GetFileContent()
         * DESCRIPTION: This function takes the directory to look in, grabs the names of all the files in that
         *              directory, and stores them in a list. The list is then converted into JSON and returned
         *              to the client making the call.
         * PARAMETERS: string of the directory name to look in in order to grab the file names. 
         * RETURN: the serialized JSON string containing all of the file content.
         */
        public static string GetFileContent(string file)
        {
            string returnData;
            string filepath;

            try
            {
                filepath = HttpContext.Current.Server.MapPath("MyFiles");
                filepath = filepath + @"\" + file;

                // validate that the file exists
                if (File.Exists(filepath))
                {
                    FileStatus = "Success";
                    FileContent = File.ReadAllText(filepath);
                }
                // if the user is currently on the "blank new file" option, this is okay, but 
                // we have to make sure that the text area is blank, so we send back an empty string. 
                else if (file == "Blank new file")
                {
                    FileStatus = "Success";
                    FileContent = "";
                }
                else
                {
                    FileStatus = "Failure";
                    FileContent = "File doesn't exist";
                }
            }
            catch (Exception)
            {
                // display the error message in the text area
                FileContent = "There was an error loading the contents of this file. Please try another file.";
            }

            returnData = JsonConvert.SerializeObject(new { status = FileStatus, content = FileContent });
            return returnData;
        }
    }
}

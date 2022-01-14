<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="startPage.aspx.cs" Inherits="textEditor._default" EnableEventValidation="false" EnableViewState="true" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>Online Text Editor</title>
    <link rel="stylesheet" href="styles/styles.css">
    <script src="Scripts/jquery-3.6.0.min.js" type="text/javascript"></script>
    <script type="text/javascript" src="Scripts/textEditor.js"></script>
</head>
<body>
    <div id="title">Online Text Editor</div>
    <div>_______________________________________________________</div>
    <div id="labels">Select a file:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Current File:</div>
    <form id="form1" runat="server">
        <div>

            <!-- note both the server side OnClick vs. the client side OnClick for these buttons-->
            <asp:Button ID="btn_Save" CssClass="btn_Save" runat="server" Text="Save" OnClick="SaveClick" OnClientClick="return SavePopup()" />
            <asp:Button ID="btn_SaveAs" CssClass="btn_SaveAs" runat="server" Text="Save As" OnClick="btn_SaveAs_Click" OnClientClick="return SaveAsPopup()" />

            <asp:DropDownList ID="fileDropdown" CssClass="fileDropdown" runat="server">
                <asp:ListItem>Blank new file</asp:ListItem>
            </asp:DropDownList>

            <!-- hover over information popups -->
            <button disabled id="dropdownInfo" title="Select a file from the list to see its contents. You can then modify and save its content.">?</button>

            <asp:TextBox ID="fileNameInput" CssClass="fileNameInput" runat="server"></asp:TextBox>
            <button disabled id="fileNameInfo" title="Enter a new file name to create a new file. Existing files will be overwritten.">?</button>
        </div>
        <div>
            <asp:TextBox
                ID="textSpace"
                CssClass="textSpace"
                runat="server" Width="700"
                Height="360"
                TextMode="MultiLine">
            </asp:TextBox>
        </div>

        <!-- this is where user feedback will appear -- under the editor -->
        <asp:Label ID="userFeedback" CssClass="userFeedback" runat="server" Text=""></asp:Label>
    </form>
</body>
</html>

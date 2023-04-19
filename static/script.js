$(document).ready(function () {
   let conversation_history = "";
   // Show overlay on page load
   $(".overlay").show();
   // Handle start chat button click
   $("#start-chat-button").on("click", function () {
      $(".overlay").fadeOut("slow");
      $(".chat-container").fadeIn("slow");
   });
   // AI's greeting
   let greeting = "Hello, I'm an SAT/ACT tutor powered with AI. How can I help you today?";
   appendMessage(greeting, "Tutor");
   conversation_history += `Tutor: ${greeting}\n`;

   function appendMessage(message, sender) {
      let senderClass = sender === "You" ? "chat-message-text-user" : "chat-message-text-bot";
      let messageHtml = `
  <div class="chat-message">
  <div class="chat-message-text ${senderClass}">
  <b>${sender}:</b> ${message}`;

      if (sender === "Tutor" && message === "typing") {
         messageHtml += `
  <div class="typing-indicator">
  <span></span>
  <span></span>
  <span></span>
  </div>`;
      }

      messageHtml += `
  </div>
  </div>`;
      $("#chat-box").append(messageHtml);
      $("#chat-box").scrollTop($("#chat-box")[0].scrollHeight);
   }


   function askQuestion() {
      let question = $("#chat-input").val();
      if (question.trim() === "") return;
      appendMessage(question, "You");
      conversation_history += `You: ${question}\nTutor: `;
      $("#chat-input").val("");
      $("#chat-submit").prop("disabled", true);

      // Show the typing indicator
      appendMessage("typing", "Tutor");

      $.ajax({
         type: "POST",
         url: "/ask",
         data: {
            question: question,
            conversation_history: conversation_history,
         },
         success: function (response) {
            console.log("Response object:", response);
            // Remove the typing indicator
            $(".typing-indicator").parent().remove();
            appendMessage(response.response, "Tutor");
            conversation_history += `${response.response}\n`;
         },
         error: function () {
            // Remove the typing indicator
            $(".typing-indicator").parent().remove();
            appendMessage("Error: Unable to reach the Tutor.", "Tutor");
         },
         complete: function () {
            $("#chat-submit").prop("disabled", false);
         },
      });
   }

   $("#chat-submit").on("click", function (e) {
      e.preventDefault();
      askQuestion();
   });
   $("#chat-input").on("keydown", function (e) {
      if (e.key === "Enter") {
         if (e.shiftKey) {
            // If Shift+Enter is pressed, insert a newline character at cursor position
            let cursorPos = this.selectionStart;
            let value = $(this).val();
            $(this).val(value.substring(0, cursorPos) + "\n" + value.substring(cursorPos));

            // Set cursor position after the inserted newline character
            this.selectionStart = cursorPos + 1;
            this.selectionEnd = cursorPos + 1;

            // Prevent default behavior of the Enter       key
            e.preventDefault();
         } else {
            // If only Enter is pressed, submit the question
            e.preventDefault();
            askQuestion();
         }
      }
   });
});

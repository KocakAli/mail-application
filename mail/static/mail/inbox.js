document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit',submit_mail)

  // By default, load the inbox
  load_mailbox('inbox');
});


function get_mail(id){
  
    fetch('/emails/' +id)
  .then(response => response.json())
  .then(email => {

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#mail').style.display = 'block';
    
    let arch='';
    if(email['archived'] == 0){
      arch = 'Archive';
    }
    else{
      arch = 'Unarchive';
    }
    console.log(email['archived'])

    

    const mail = document.querySelector('#mail');
    console.log(document.querySelector('h2').innerHTML)
    console.log(email['sender'])
    if(email['sender'] === document.querySelector('h2').innerHTML){
      mail.innerHTML = `
      <ul class='list-group'>
        <li class='list-group-item'><strong>From:</strong> <span>${email['sender']}</span></li>
        <li class='list-group-item'><strong>Subject:</strong> <span>${email['subject']}</span</li>
        <li class='list-group-item'><strong>Recipients:</strong> <span>${email['recipients']}</span</li>
        
      </ul>
      <div class='mt-3' style='height:400px; border:1px solid lightgray'> 
          <p style='margin-left:15px; margin-top:15px;'>${email['body']}</p>
      </div>
      <ul class='list-group'>
        <li class="list-group-item"><strong>Time:</strong> <span>${email['timestamp']}</span>
        </li>
        
      </ul>
    `;


    }
    else{
      mail.innerHTML = `
      <ul class='list-group'>
        <li class='list-group-item'><strong>From:</strong> <span>${email['sender']}</span></li>
        <li class='list-group-item'><strong>Subject:</strong> <span>${email['subject']}</span</li>
        <li class='list-group-item'><strong>Recipients:</strong> <span>${email['recipients']}</span</li>
        
      </ul>
      <div class='mt-3' style='height:400px; border:1px solid lightgray'> 
          <p style='margin-left:15px; margin-top:15px;'>${email['body']}</p>
      </div>
      <ul class='list-group'>
        <li class='list-group-item'><strong>Time:</strong> <span>${email['timestamp']}</span>
        <button id='reply' type="button" class="btn btn-secondary">Reply</button>
        <button id='arch' type="button" class="btn btn-secondary">${arch}</button>
        </li>
        
      </ul>
    `;
    }
    
      document.querySelector('#arch').addEventListener('click', function(){
        
        fetch('/emails/' + email['id'], {
          method: 'PUT',
          body: JSON.stringify({ archived : !email['archived'] })
        })
        .then(response => 
          load_mailbox('archive'))
      })

      document.querySelector('#reply').addEventListener('click',function(){
        document.querySelector('#mail').style.display = 'none';
        compose_email();

        document.querySelector('#compose-recipients').value = email['sender'];
        let subject = email['subject'];
        console.log(subject.split(" ", 1)[0]);
        if (subject.split(" ", 1)[0] != "Re:") {
          subject = "Re: " + subject;
        }
        document.querySelector('#compose-subject').value = subject;
        let body = `On ${email['timestamp']}, ${email['sender']} wrote: ${email['body']} `;
        document.querySelector('#compose-body').value = body;
      })
  });
  
  fetch('/emails/'+id, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  load_mailbox('inbox');
  
  
}

function submit_mail(event){
  event.preventDefault()
  recipients = document.querySelector('#compose-recipients').value;
  subject = document.querySelector('#compose-subject').value;
  body = document.querySelector('#compose-body').value;

  fetch('/emails',{
    method:'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject : subject,
      body:body

    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
  })
  load_mailbox('sent');
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch('/emails/' +mailbox )
  .then(response => response.json())
  .then(emails => {
    console.log(emails);

    // ... do something else with email ...
    emails.forEach(function(email){
      var p1 = document.createElement('p')
      var p2 = document.createElement('p')
      var p3 = document.createElement('p')
      p1.className ='d-flex justify-content-center p-3'
      p2.className ='d-flex justify-content-center p-3'
      p3.className ='d-flex justify-content-center p-3'
      
      const sender = document.createTextNode('From: ' + email['sender']);
      const recipients = document.createTextNode(email['recipients']);
      const subject = document.createTextNode('Subject: ' + email['subject']);
      const time = document.createTextNode('Time: ' + email['timestamp']);
      if (document.querySelector('h3').innerHTML == 'Inbox'){
        p1.appendChild(sender);
      }
      else{
        p1.appendChild(recipients);
      }
      p2.appendChild(subject);
      p3.appendChild(time)
      var div= document.createElement('div') 
      if (email['read'] == 1){
        div.style.backgroundColor = 'lightgray'
      }
      div.className ='grid'

        
      
      document.querySelector('#emails-view').appendChild(div); 
      div.appendChild(p1)
      div.appendChild(p2)
      div.appendChild(p3)
      
      div.addEventListener('click', function(){
        get_mail(email['id'])
      })
  });
});
  
  // Show the mailbox and hide other views
  document.querySelector('#mail').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  
}
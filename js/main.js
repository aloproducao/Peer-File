/* global $ch, Peer, FileReaderJS */

// The API key for Peer.JS WebRTC library.
var PEER_KEY = 'm2ir2tnmldqjjor';

// Global event names.
var EVENT = {
  READY_PEER: 'ready peer'
};

// Notification postfix.
var NOTIFICATION = ' has been delivered.';

// Peer template filename.
var PEER_TEMPLATE = 'peer-template.html';

// Global ChopJS source for keeping all received files' meta data.
$ch.source('files', []);

// Global notification source.
$ch.source('notify', []);

$ch.require(['ui', 'layout', 'utils', 'event', 'scope', 'router'], function () {
  'use strict';

  // Generate a random ID postfix to ensure there would not be (ideally)
  // any users using same ID.
  var postfix = $ch.utils.random(2, 20) * $ch.utils.random(2, 20);

  // Global ChopJS event: `ready peer`.
  //
  //      data = {
  //        container: peerScope_container,
  //        username: username
  //      }
  $ch.event.listen(EVENT.READY_PEER, function (data) {
    var container = data.container;
    var username = data.username;

    var template = $ch.readFile(PEER_TEMPLATE);
    container.html(template);
    // Register `peerScope`.
    readyPeerScope(username);
  });

  $ch.scope('appScope', function ($scope, $event) {
    // Initialize `username` to an empty string.
    $scope.username.set('');

    // Listen `login` event.
    $event.listen('login', function () {
      // If `username` is an empty string, nothing should happens.
      var username = $scope.username.get().trim();
      if (username === '') {
        return;
      }

      // Otherwise, fire global `ready peer` event
      // and pass `peerContainer` and `username`.
      $ch.event.emit(EVENT.READY_PEER, {
        container: $scope.peerContainer,
        username: username
      });
    })
    // Now, listen `keyLogin` event.
    .listen('keyLogin', function (evt) {
      // Only try to login when `enter` is hit.
      if (evt.keyCode === 13) {
        $event.emit('login');
      }
    });
  });

  // Function to register `peerScope`.
  //
  // + `username`: username.
  function readyPeerScope(username) {
    $ch.scope('peerScope', function ($scope, $event) {
      // Show user ID.
      var id = username + postfix;
      $scope.idDiv.content(id);

      // Startup Peer WebRTC.
      var peer = new Peer(id, {key: 'm2ir2tnmldqjjor'});
      var conn;

      // Listen scope `connect` event.
      $event.listen('connect', function () {
        // Make a peer connection to `recipient`.
        var recipient = $scope.recipient.get() || '';
        if (recipient.trim() !== '') {
          conn = peer.connect(recipient);
          // Toggle indicator.
          $scope.indicator.content('connected').removeClass('disconnected').addClass('connected');
          console.log('Peer connected: ' + recipient);
        }
      });

      // Listen peer connection.
      peer.on('connection', function (con) {
        con.on('data', function (data) {
          // Push file `data` to global files storage.
          var files = $ch.source('files');
          files.push(data);
          $ch.source('files', files);

          // Now, render inline template against global `files`.
          $scope.filesDiv.inline(files);

        });
      });

      // Scope variable for keeping notifications.
      $scope.notifies = [];

      // Set file drop zone.
      FileReaderJS.setupDrop($scope.dropzone.el, {
        dragClass: 'drop',
        readAsDefault: 'DataURL',
        on: {
          // Send file meta to peer.
          load: function (e, file) {
            // If no recipient specified, do nothing.
            var recipient = $scope.recipient.get() || '';
            if (recipient.trim() === '') {
              return;
            }

            // Now, send file meta data to peer.
            conn.send({
              filename: file.name,
              size: (file.size / 1024).toFixed(2), // convert file size into KB.
              url: e.target.result
            });

            // Push notification to scope `notifies`.
            $scope.notifies.push({filename: file.name});
            $scope.notification.inline($scope.notifies);

            // Pop notification every 5 seconds.
            setTimeout(function () {
              $scope.notifies.pop();
              if ($scope.length !== 0) {
                $scope.notification.inline($scope.notifies);
              }
            }, 5000);
          }
        }
      });

    });
  }

});
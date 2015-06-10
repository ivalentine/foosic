WebsocketRails::EventMap.describe do

  # when client connects to the WebSocket, run 'set_username' method of WebsocketsController
  subscribe :client_connected, 'websockets#set_username'

  # when client gets online users, populate list
  subscribe :get_online_users, 'websockets#get_online_users'

  # send request for connection
  subscribe :request_connection, 'websockets#request_connection'

  # handle accepted requests
  subscribe :accept_connection, 'websockets#accept_connection'

  # handle failed requests
  subscribe :reject_connection, 'websockets#reject_connection'

  # handle requests for all samples
  subscribe :get_all_sample_data, 'websockets#get_all_sample_data'

  # You can use this file to map incoming events to controller actions.
  # One event can be mapped to any number of controller actions. The
  # actions will be executed in the order they were subscribed.
  #
  # Uncomment and edit the next line to handle the client connected event:
  #   subscribe :client_connected, :to => Controller, :with_method => :method_name
  #
  # Here is an example of mapping namespaced events:
  #   namespace :product do
  #     subscribe :new, :to => ProductController, :with_method => :new_product
  #   end
  # The above will handle an event triggered on the client like `product.new`.
end

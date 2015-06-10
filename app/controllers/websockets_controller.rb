class WebsocketsController < WebsocketRails::BaseController

  def set_username
    if current_user
      username = current_user.username
      signed_in = true
    else
      username = [["BIG","TURNT","LAZY","SLEEPY","TINY"].sample,["STOMPER","JAMMER","ROCKER","WAILER"].sample,rand(0..100).to_s].join("-")
      signed_in = false
    end
    connection_store[:username] = username
    send_message :set_username, {username: username, signed_in: signed_in}
  end

  def get_online_users
    users = connection_store.collect_all(:username)
    users.delete(connection_store[:username])
    if users.size > 0
      trigger_success users
    end
  end

  def request_connection
    WebsocketRails[message[:receiver]].trigger 'connection_requested', message
  end

  def accept_connection
    WebsocketRails[message[:sender]].trigger 'connection_accepted', message
  end

  def reject_connection
    WebsocketRails[message[:sender]].trigger 'connection_rejected', message
  end

  def get_all_sample_data
    if user_signed_in?
      samples = Sample.where("user_id = ? OR user_id IS NULL", current_user.id)
    else
      samples = Sample.where("user_id IS NULL")
    end
    trigger_success samples
  end

end

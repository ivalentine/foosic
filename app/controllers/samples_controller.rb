class SamplesController < ApplicationController

  def index
    if user_signed_in?
      @samples = Sample.where("user_id = ? OR user_id IS NULL", current_user.id)
    else
      @samples = Sample.where("user_id IS NULL")
    end
    respond_to do |format|
      format.json {render json: @samples}
      format.html {}
    end 
  end

  def create
    Sample.create(name: params[:fileName], user_id: current_user.id)
    respond_to do |format|
      #send back "all's well" but don't do anything else.
      format.json { head :ok }
    end
  end

  def new_html
    if !user_signed_in?
      redirect_to new_user_session_path, :alert => "You must be logged in to create a sample."
    end
  end

  def new
    @token = nil
    @app_key = nil
    if !user_signed_in?
      redirect_to new_user_session_path, :alert => "You must be logged in to create a sample."
    elsif current_user.connected_to_dropbox?
      @token = current_user.dropbox_token
    else
      @app_key = ENV['APP_KEY']
    end
    respond_to do |format|
      format.json {render json: { :app_key => @app_key, :user_token => @token }.to_json }
      format.html {}
    end
  end

end

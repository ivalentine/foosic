class Users::SessionsController < Devise::SessionsController
  def save_token
    #save user token
    @user = current_user
    @user.dropbox_token = params["dropBoxToken"]
    @user.save
    respond_to do |format|
      #send back "all's well" but don't do anything else.
      format.json { head :ok }
    end
  end

  def lookup
    @user = current_user
    respond_to do |format|
      #send back token of current user
      format.json {render json: {token: @user.dropbox_token}.to_json}
    end
  end


# before_filter :configure_sign_in_params, only: [:create]

  # GET /resource/sign_in
  # def new
  #   super
  # end

  # POST /resource/sign_in
  # def create
  #   super
  # end

  # DELETE /resource/sign_out
  # def destroy
  #   super
  # end

  protected

  # If you have extra params to permit, append them to the sanitizer.
  def configure_sign_in_params
    devise_parameter_sanitizer.for(:sign_in) << :username
  end
end

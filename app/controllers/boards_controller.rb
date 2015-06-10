class BoardsController < ApplicationController

  def index
    if user_signed_in?
      @boards = Board.where("user_id = ? OR user_id IS NULL", current_user.id)
    else
      @boards = Board.where("user_id IS NULL")
    end
    respond_to do |format|
      format.json {render json: @boards}
    end
  end

  def show
    @first_visit = !cookies.permanent[:first_visit]
    cookies.permanent[:first_visit] = 1
  end

  def lookup
    @board = Board.find(params[:id])
    respond_to do |format|
      format.json {render json: @board.get_samples}
    end
  end

  def create
    if user_signed_in?
      @board = Board.create(name: params[:name], user_id: current_user.id)
      params[:sampleData].each do |pad_id, sample|
        @board.assign_pad(pad_id, sample["id"])
      end
    end
    respond_to do |format|
      #send back "all's well" but don't do anything else.
      format.js { head :ok }
    end
  end

end

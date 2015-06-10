# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path
Rails.application.config.assets.precompile += %w( board.js )
Rails.application.config.assets.precompile += %w( sample_menu.js )
Rails.application.config.assets.precompile += %w( web_audio_helpers.js )
Rails.application.config.assets.precompile += %w( looping_helpers.js )
Rails.application.config.assets.precompile += %w( board_helpers.js )
Rails.application.config.assets.precompile += %w( peerjs_connection_helpers.js )
Rails.application.config.assets.precompile += %w( new_sample.js )

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
# Rails.application.config.assets.precompile += %w( search.js )

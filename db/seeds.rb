# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)



pad1 = Sample.create(name: "Boom Kick", url:"https://s3-us-west-2.amazonaws.com/s.cdpn.io/282817/Boom-Kick.wav")
pad2 = Sample.create(name: "Electric-Bass-High-Bb-Staccato", url:"https://s3-us-west-2.amazonaws.com/s.cdpn.io/282817/Electric-Bass-High-Bb-Staccato.wav")
pad3 = Sample.create(name: "Contact Mic", url:"https://s3-us-west-2.amazonaws.com/s.cdpn.io/282817/ContactMic_Samples-NORM_79_Surprise_Sample_Pack.wav")
pad4 = Sample.create(name: "Cymbal_Zildjian", url:"https://s3-us-west-2.amazonaws.com/s.cdpn.io/282817/Cymbal_Zildjian_Avedis_12_st_mallets_07_Cymbal_Essentials.wav")
pad5 = Sample.create(name: "SD_militaire_synth", url:"https://s3-us-west-2.amazonaws.com/s.cdpn.io/282817/SD_militaire_synth_Synthdrum_PAck.wav")
pad6 = Sample.create(name: "booga_hit_double", url:"https://s3-us-west-2.amazonaws.com/s.cdpn.io/282817/booga_hit_doubleb06_World_Sounds_Vol1.wav")
pad7 = Sample.create(name: "ghana_bell_high", url:"https://s3-us-west-2.amazonaws.com/s.cdpn.io/282817/ghana_bell_high_Bell_Essentials.wav")
pad8 = Sample.create(name: "glass2_Bell", url:"https://s3-us-west-2.amazonaws.com/s.cdpn.io/282817/glass2_Bell_Essentials.wav")
pad9 = Sample.create(name: "yipp23_Analog", url:"https://s3-us-west-2.amazonaws.com/s.cdpn.io/282817/yipp23_Analog_Attitude.wav")


pad10 = Sample.create(name: "Boom Sub Analog", url: "https://dl.dropboxusercontent.com/s/0mtn1dbly5ua8be/BD_8forboom-sub_Analog%20Attitude.wav?dl=0")

pad11 = Sample.create(name: "Bell Mimo Analog", url: "https://dl.dropboxusercontent.com/s/z0iabnu3sjzkmgu/bell%20mimo_Analog%20Attitude.wav?dl=0")

pad12 = Sample.create(name: "Bella Synthdrum", url: "https://dl.dropboxusercontent.com/s/g0zwwn98k0mogoc/bella_Synthdrum%20Pack.wav?dl=0")

pad13 = Sample.create(name: "Multi Clap", url: "https://dl.dropboxusercontent.com/s/f1ug3l6uzzka1i4/Clap_multi%20snap.wav?dl=0")

pad14 = Sample.create(name: "Cereal", url: "https://dl.dropboxusercontent.com/s/d3svfvhk9x09b4c/SD_cereal%20me.wav?dl=0")

pad15 = Sample.create(name: "Don't wanna", url: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/282817/I_don't_wanna_do_it.wav")
pad16 = Sample.create(name: "Let's do it", url: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/282817/Let's_do_it.wav")
pad17 = Sample.create(name: "Let's doo it", url: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/282817/Let's_doo_it.wav")

pad18 = Sample.create(name: "Kanye Piano 1", url:"https://dl.dropboxusercontent.com/s/wwtv72568d9qzll/piano1.wav?dl=0")
pad19 = Sample.create(name: "Kanye Piano 2", url:"https://dl.dropboxusercontent.com/s/zd50gwtqkuvqd7o/piano2.wav?dl=0")
pad20 = Sample.create(name: "Kanye Piano 3", url:"https://dl.dropboxusercontent.com/s/o1912g16dulfajd/piano3.wav?dl=0")
pad21 = Sample.create(name: "Kanye Piano 4", url:"https://dl.dropboxusercontent.com/s/1mc6vqqc6obmp3u/piano4.wav?dl=0")
pad22 = Sample.create(name: "Kanye Piano 5", url:"https://dl.dropboxusercontent.com/s/q6sfrzkbu8pyvtl/piano5.wav?dl=0")
pad23 = Sample.create(name: "Kanye Piano 6", url:"https://dl.dropboxusercontent.com/s/d51whv9zml9osu6/piano6.wav?dl=0")
pad24 = Sample.create(name: "Kanye Piano 7", url:"https://dl.dropboxusercontent.com/s/is6q74ew4qc09tx/piano7.wav?dl=0")
pad25 = Sample.create(name: "Kanye Piano 8", url:"https://dl.dropboxusercontent.com/s/ds98tqpgnqtqo2f/piano8.wav?dl=0")
pad26 = Sample.create(name: "Look at ya", url:"https://dl.dropboxusercontent.com/s/zc2o9wqu5a7bvfn/Look_at_ya.wav?dl=0")

board1 = Board.create(name: "Default")
board1.assign_pad(0, 1)
board1.assign_pad(1, 2)
board1.assign_pad(2, 3)
board1.assign_pad(3, 4)
board1.assign_pad(4, 5)
board1.assign_pad(5, 6)
board1.assign_pad(6, 7)
board1.assign_pad(7, 8)
board1.assign_pad(8, 9)

board2 = Board.create(name:"Kanye")
board2.assign_pad(0, 18)
board2.assign_pad(1, 19)
board2.assign_pad(2, 20)
board2.assign_pad(3, 21)
board2.assign_pad(4, 22)
board2.assign_pad(5, 23)
board2.assign_pad(6, 24)
board2.assign_pad(7, 25)
board2.assign_pad(8, 26)






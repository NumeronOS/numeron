  // Copyright (c) Obelisk Labs, Inc.
  // SPDX-License-Identifier: Apache-2.0
  #[allow(unused_use)]
  
  /* Autogenerated file. Do not edit manually. */
  
  module numeron::numeron_monster_ball_type {

  public enum MonsterBallType has copy, drop , store {
                                Great,Poke,Ultra
                        }

  public fun new_great(): MonsterBallType {
    MonsterBallType::Great
  }

  public fun new_poke(): MonsterBallType {
    MonsterBallType::Poke
  }

  public fun new_ultra(): MonsterBallType {
    MonsterBallType::Ultra
  }
}

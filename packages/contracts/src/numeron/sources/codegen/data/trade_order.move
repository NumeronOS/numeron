  // Copyright (c) Obelisk Labs, Inc.
  // SPDX-License-Identifier: Apache-2.0
  #[allow(unused_use)]
  
  /* Autogenerated file. Do not edit manually. */
  
  module numeron::numeron_trade_order {

  use std::ascii::String;

  use numeron::numeron_item::Item;

  public struct TradeOrder has copy, drop, store {
    id: u256,
    creator: address,
    items: vector<Item>,
    price: u256,
    created_at: u64,
    expired_at: u64,
  }

  public fun new(
    id: u256,
    creator: address,
    items: vector<Item>,
    price: u256,
    created_at: u64,
    expired_at: u64,
  ): TradeOrder {
    TradeOrder {
                                   id,creator,items,price,created_at,expired_at
                               }
  }

  public fun get(self: &TradeOrder): (u256,address,vector<Item>,u256,u64,u64) {
    (self.id,self.creator,self.items,self.price,self.created_at,self.expired_at)
  }

  public fun get_id(self: &TradeOrder): u256 {
    self.id
  }

  public fun get_creator(self: &TradeOrder): address {
    self.creator
  }

  public fun get_items(self: &TradeOrder): vector<Item> {
    self.items
  }

  public fun get_price(self: &TradeOrder): u256 {
    self.price
  }

  public fun get_created_at(self: &TradeOrder): u64 {
    self.created_at
  }

  public fun get_expired_at(self: &TradeOrder): u64 {
    self.expired_at
  }

  public(package) fun set_id(self: &mut TradeOrder, id: u256) {
    self.id = id;
  }

  public(package) fun set_creator(self: &mut TradeOrder, creator: address) {
    self.creator = creator;
  }

  public(package) fun set_items(self: &mut TradeOrder, items: vector<Item>) {
    self.items = items;
  }

  public(package) fun set_price(self: &mut TradeOrder, price: u256) {
    self.price = price;
  }

  public(package) fun set_created_at(self: &mut TradeOrder, created_at: u64) {
    self.created_at = created_at;
  }

  public(package) fun set_expired_at(self: &mut TradeOrder, expired_at: u64) {
    self.expired_at = expired_at;
  }

  public(package) fun set(
    self: &mut TradeOrder,
    id: u256,
    creator: address,
    items: vector<Item>,
    price: u256,
    created_at: u64,
    expired_at: u64,
  ) {
    self.id = id;
    self.creator = creator;
    self.items = items;
    self.price = price;
    self.created_at = created_at;
    self.expired_at = expired_at;
  }
}

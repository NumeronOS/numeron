export function weightedRandom(data: number[][]) {
  // Split input into two separate arrays of values and weights.
  const values = data.map(d => d[0]);
  const weights = data.map(d => d[1]);

  // calculate the cumulative weights based on the weights that were provided
  const cumulativeWeights = [];
  for (let i = 0; i < weights.length; i += 1) {
    cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);
  }
  /**
   * By adding the weights together cumulative, this gives us a range were
   * a single weight would represent more possible values to choose from.
   * Example: if weights were [1, 3, 2, 5], then our cumulative weights would be
   * [1, 4, 6, 11], and this would represent the following ranges for each weight:
   * 1 - 1
   * 3 - 2,3,4
   * 2 - 5,6
   * 5 - 7,8,9,10,11
   * So by picking a random number between 1 - 11, would mean higher weights have more
   * chances to be picked.
   */

  // choose random value based on the range from 0 to our max weight
  const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
  const randomNumber = maxCumulativeWeight * Math.random();

  // using the random value, find the first element in the array were the weight is more than
  // the random value. By filtering the array, we know the index of element in the cumulative
  // weights array that is the value we want to return
  return values[cumulativeWeights.filter(element => element <= randomNumber).length];
}

export function generateUuid(): string {
  return Phaser.Math.RND.uuid();
}

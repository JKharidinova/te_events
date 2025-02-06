def find_pairs(arr):
    sums = {}
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            s = arr[i] + arr[j]
            (
                sums[s].append((arr[i], arr[j]))
                if s in sums
                else sums.setdefault(s, []).append((arr[i], arr[j]))
            )

    for k, v in sorted(sums.items()):
        if len(v) == 1:
            continue
        print(f"Pairs: {v[0]} {v[1]} have sum: {k}")


A1 = [6, 4, 12, 10, 22, 54, 32, 42, 21, 11]
A2 = [4, 23, 65, 67, 24, 12, 86]

find_pairs(A1)
find_pairs(A2)

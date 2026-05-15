"""
TP5 - Benchmark Comparatif NoSQL
Mesurer les performances de Redis, MongoDB, Cassandra, Neo4j
"""

import time
import statistics
import uuid
from typing import Callable
import threading

import redis
from pymongo import MongoClient, InsertOne
from cassandra.cluster import Cluster
from cassandra.query import BatchStatement, BatchType
from neo4j import GraphDatabase


# ─── Utilitaires de mesure ───────────────────────────────────────────────────

def measure_latency(fn: Callable, iterations: int = 1000) -> dict:

    latencies = []

    for _ in range(iterations):

        start = time.perf_counter()

        fn()

        latencies.append(
            (time.perf_counter() - start) * 1000
        )

    latencies.sort()

    return {
        "mean_ms": statistics.mean(latencies),
        "p50_ms": latencies[int(0.50 * len(latencies))],
        "p95_ms": latencies[int(0.95 * len(latencies))],
        "p99_ms": latencies[int(0.99 * len(latencies))],
        "max_ms": max(latencies),
        "throughput_rps": 1000 / statistics.mean(latencies)
    }


def print_results(name: str, results: dict):

    print(f"\n{'='*50}")
    print(f" {name}")
    print(f"{'='*50}")

    for k, v in results.items():
        print(f"  {k:20s}: {v:.2f}")


# ─── Ex1 : Benchmark Écriture ────────────────────────────────────────────────

def benchmark_write_redis(n: int = 100_000):

    r = redis.Redis(
        host='localhost',
        port=6379,
        decode_responses=True
    )

    r.flushdb()

    start = time.time()

    pipe = r.pipeline()

    for i in range(n):

        pipe.set(
            f"product:{i}",
            f"value-{i}"
        )

        # Flush pipeline chaque 1000 opérations
        if i % 1000 == 0:
            pipe.execute()

    pipe.execute()

    elapsed = time.time() - start

    results = {
        "records": n,
        "duration_s": elapsed,
        "throughput_rps": n / elapsed
    }

    print_results("Redis WRITE", results)


def benchmark_write_mongodb(n: int = 100_000):

    client = MongoClient(
        "mongodb://admin:admin123@localhost:27017/"
    )

    db = client["benchmark"]

    collection = db["products"]

    collection.drop()

    start = time.time()

    operations = []

    for i in range(n):

        operations.append(
            InsertOne({
                "_id": i,
                "name": f"product-{i}",
                "price": i % 1000,
                "category": "electronics"
            })
        )

        if len(operations) == 1000:
            collection.bulk_write(operations)
            operations = []

    if operations:
        collection.bulk_write(operations)

    elapsed = time.time() - start

    results = {
        "records": n,
        "duration_s": elapsed,
        "throughput_rps": n / elapsed
    }

    print_results("MongoDB WRITE", results)


def benchmark_write_cassandra(n: int = 100_000):

    cluster = Cluster(['localhost'])

    session = cluster.connect()

    session.execute("""
        CREATE KEYSPACE IF NOT EXISTS benchmark
        WITH replication = {
            'class': 'SimpleStrategy',
            'replication_factor': 1
        }
    """)

    session.set_keyspace("benchmark")

    session.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY,
            name TEXT,
            price FLOAT
        )
    """)

    insert_stmt = session.prepare("""
        INSERT INTO products (id, name, price)
        VALUES (?, ?, ?)
    """)

    start = time.time()

    batch = BatchStatement(
        batch_type=BatchType.UNLOGGED
    )

    count = 0

    for i in range(n):

        batch.add(
            insert_stmt,
            (
                uuid.uuid4(),
                f"product-{i}",
                float(i % 1000)
            )
        )

        count += 1

        # Batch de 50
        if count == 50:

            session.execute(batch)

            batch = BatchStatement(
                batch_type=BatchType.UNLOGGED
            )

            count = 0

    if count > 0:
        session.execute(batch)

    elapsed = time.time() - start

    results = {
        "records": n,
        "duration_s": elapsed,
        "throughput_rps": n / elapsed
    }

    print_results("Cassandra WRITE", results)

    cluster.shutdown()


# ─── Ex2 : Benchmark Lecture ────────────────────────────────────────────────

def benchmark_read_redis():

    r = redis.Redis(
        host='localhost',
        port=6379,
        decode_responses=True
    )

    # Point lookup
    point_results = measure_latency(
        lambda: r.get("product:500"),
        1000
    )

    print_results(
        "Redis READ - Point Lookup",
        point_results
    )

    # Pipeline multi-get
    multi_results = measure_latency(
        lambda: r.mget([
            "product:1",
            "product:2",
            "product:3",
            "product:4",
            "product:5"
        ]),
        1000
    )

    print_results(
        "Redis READ - Multi GET",
        multi_results
    )


def benchmark_read_mongodb():

    client = MongoClient(
        "mongodb://admin:admin123@localhost:27017/"
    )

    db = client["benchmark"]

    collection = db["products"]

    # find_one
    find_one_results = measure_latency(
        lambda: collection.find_one({"_id": 500}),
        1000
    )

    print_results(
        "MongoDB READ - find_one",
        find_one_results
    )

    # Range query
    range_results = measure_latency(
        lambda: list(
            collection.find({
                "price": {
                    "$gte": 100,
                    "$lte": 200
                }
            }).limit(20)
        ),
        1000
    )

    print_results(
        "MongoDB READ - Range Query",
        range_results
    )

    # Aggregate pipeline
    aggregate_results = measure_latency(
        lambda: list(
            collection.aggregate([
                {
                    "$group": {
                        "_id": "$category",
                        "avg_price": {
                            "$avg": "$price"
                        }
                    }
                }
            ])
        ),
        200
    )

    print_results(
        "MongoDB READ - Aggregate",
        aggregate_results
    )


# ─── Ex3 : Charge concurrente ────────────────────────────────────────────────

def benchmark_concurrent(
    db_fn: Callable,
    n_clients: int = 50,
    requests_per_client: int = 200
):

    latencies = []

    def worker():

        for _ in range(requests_per_client):

            start = time.perf_counter()

            db_fn()

            elapsed = (
                time.perf_counter() - start
            ) * 1000

            latencies.append(elapsed)

    threads = []

    start_global = time.time()

    for _ in range(n_clients):

        t = threading.Thread(target=worker)

        t.start()

        threads.append(t)

    for t in threads:
        t.join()

    total_elapsed = time.time() - start_global

    latencies.sort()

    results = {
        "total_requests":
            n_clients * requests_per_client,

        "duration_s":
            total_elapsed,

        "mean_ms":
            statistics.mean(latencies),

        "p95_ms":
            latencies[int(0.95 * len(latencies))],

        "throughput_rps":
            len(latencies) / total_elapsed
    }

    print_results(
        "Concurrent Benchmark",
        results
    )


# ─── Main ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":

    print("🚀 Benchmark NoSQL - Comparatif des 4 technologies")
    print("=" * 60)

    N = 10_000

    print(f"\n📝 Benchmark Écriture ({N:,} enregistrements)")

    benchmark_write_redis(N)

    benchmark_write_mongodb(N)

    benchmark_write_cassandra(N)

    print(f"\n📖 Benchmark Lecture (1,000 requêtes)")

    benchmark_read_redis()

    benchmark_read_mongodb()

    print(f"\n⚡ Test Charge Concurrente (50 clients)")

    r = redis.Redis(
        host='localhost',
        port=6379,
        decode_responses=True
    )

    benchmark_concurrent(
        lambda: r.get("product:500")
    )

    print("\n✅ Benchmark terminé ! Consultez RAPPORT.md pour l'analyse.")
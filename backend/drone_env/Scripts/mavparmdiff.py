#!c:\users\91799\documents\app_develop\drone\droneproject\backend\drone_env\scripts\python.exe
'''
compare two MAVLink parameter files
'''

from pymavlink import mavparm

from argparse import ArgumentParser
parser = ArgumentParser(description=__doc__)
parser.add_argument("file1", metavar="FILE1")
parser.add_argument("file2", metavar="FILE2")
parser.add_argument("-t",
                    help="use tabs delimiter between columns for the output",
                    default=False,
                    action='store_true',
                    dest='use_tabs')
parser.add_argument("--full-diff",
                    help="include volatile and similar parameters",
                    default=True,
                    action='store_false',
                    dest='use_excludes')
args = parser.parse_args()

file1 = args.file1
file2 = args.file2

p1 = mavparm.MAVParmDict()
p2 = mavparm.MAVParmDict()
p1.load(file2, use_excludes=args.use_excludes)
p1.diff(file1, use_excludes=args.use_excludes, use_tabs=args.use_tabs)
